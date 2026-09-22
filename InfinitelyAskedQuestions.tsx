import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import type {
  AskedItem,
  FaqItem,
  InfinitelyAskedQuestionsProps,
} from './types';

const ERROR_TEXT = 'That question did not go through. Try asking it again.';

function formatAsQuestion(text: string): string {
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  return capitalized.endsWith('?') ? capitalized : `${capitalized}?`;
}

export function InfinitelyAskedQuestions({
  items,
  endpoint = '/api/ask',
  askInline = false,
  showAskButton,
  thinkingAnimation = false,
  askPrompt = 'Ask your own question',
  placeholder = 'What do you want to know?',
  submitLabel = 'Ask',
  className,
  onAsk,
}: InfinitelyAskedQuestionsProps) {
  const hasButton = showAskButton ?? !askInline;

  const baseId = useId();
  const askRowId = `${baseId}-ask`;

  const [openId, setOpenId] = useState<string | null>(null);
  const [asked, setAsked] = useState<AskedItem[]>([]);
  const [draft, setDraft] = useState('');
  const [isAskFocused, setIsAskFocused] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [askError, setAskError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!askInline && openId === askRowId) inputRef.current?.focus();
  }, [askInline, openId, askRowId]);

  useEffect(() => {
    if (askInline && askError) inputRef.current?.focus();
  }, [askInline, askError]);

  const toggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  const patch = useCallback((id: string, changes: Partial<AskedItem>) => {
    setAsked((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = draft.trim();
    if (!trimmed || isAsking) return;
    const question = formatAsQuestion(trimmed);

    const id = `${baseId}-asked-${Date.now()}`;
    setAsked((prev) => [...prev, { id, question, answer: '', status: 'streaming' }]);
    setOpenId(id);
    setDraft('');
    setIsAsking(true);
    setAnnouncement('');
    setAskError(null);
    onAsk?.(question);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let answer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += value;
        patch(id, { answer });
      }

      patch(id, { status: 'done' });
      setAnnouncement('Answer ready.');
    } catch {
      if (controller.signal.aborted) return;

      if (askInline) {
        setAsked((prev) => prev.filter((item) => item.id !== id));
        setOpenId((current) => (current === id ? null : current));
        setAskError(ERROR_TEXT);
      } else {
        patch(id, { status: 'error', answer: ERROR_TEXT });
      }
      setAnnouncement(ERROR_TEXT);
    } finally {
      if (!controller.signal.aborted) setIsAsking(false);
      abortRef.current = null;
    }
  }

  function renderRow(item: FaqItem, status?: AskStatusLike) {
    const isOpen = openId === item.id;
    const buttonId = `${item.id}-button`;
    const panelId = `${item.id}-panel`;
    const isStreaming = status === 'streaming';
    const isThinking = thinkingAnimation && isStreaming;

    return (
      <li
        className={['iaq__row', isThinking && 'thinking'].filter(Boolean).join(' ')}
        data-open={isOpen || undefined}
        key={item.id}
      >
        <h3 className="iaq__heading">
          <button
            type="button"
            id={buttonId}
            className="iaq__question"
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => toggle(item.id)}
          >
            <span className="iaq__question-main">
              {item.icon && (
                <span className="iaq__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="iaq__question-text">{item.question}</span>
            </span>
            <span className="iaq__marker" aria-hidden="true" />
          </button>
        </h3>
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="iaq__panel"
          data-open={isOpen || undefined}
          data-status={status}
          aria-busy={isStreaming || undefined}
        >
          <div className="iaq__panel-inner">
            <p className="iaq__answer">
              {item.answer}
              {isStreaming && <span className="iaq__caret" aria-hidden="true" />}
            </p>
          </div>
        </div>
      </li>
    );
  }

  const isAskOpen = openId === askRowId;

  return (
    <div className={['iaq', className].filter(Boolean).join(' ')}>
      <ul className="iaq__list">
        {items.map((item) => renderRow(item))}
        {asked.map((item) => renderRow(item, item.status))}

        {askInline ? (
          <li className="iaq__row iaq__row--ask">
            <form className="iaq__ask-form" onSubmit={handleSubmit}>
              <label className="iaq__label" htmlFor={`${askRowId}-input`}>
                {placeholder}
              </label>
              <div className="iaq__ask-field">
                {draft.length === 0 && (
                  <span
                    className="iaq__ask-caret"
                    data-hidden={isAskFocused || undefined}
                    aria-hidden="true"
                  />
                )}
                <input
                  id={`${askRowId}-input`}
                  ref={inputRef}
                  className="iaq__ask-input"
                  type="text"
                  value={draft}
                  maxLength={500}
                  autoComplete="off"
                  placeholder={askPrompt}
                  onChange={(event) => {
                    if (askError) setAskError(null);
                    setDraft(event.target.value);
                  }}
                  onFocus={() => setIsAskFocused(true)}
                  onBlur={() => setIsAskFocused(false)}
                  disabled={isAsking}
                />
                {hasButton && (
                  <button
                    type="submit"
                    className="iaq__ask-submit"
                    disabled={isAsking || draft.trim().length === 0}
                  >
                    {isAsking ? 'Asking' : submitLabel}
                  </button>
                )}
              </div>
              {askError ? (
                <p className="iaq__ask-error">{askError}</p>
              ) : (
                !hasButton &&
                !isAsking &&
                draft.trim().length > 0 && <p className="iaq__ask-hint">Press Enter</p>
              )}
            </form>
          </li>
        ) : (
          <li className="iaq__row iaq__row--ask">
            <h3 className="iaq__heading">
              <button
                type="button"
                id={`${askRowId}-button`}
                className="iaq__question"
                aria-expanded={isAskOpen}
                aria-controls={`${askRowId}-panel`}
                onClick={() => toggle(askRowId)}
              >
                <span className="iaq__question-text">{askPrompt}</span>
                <span className="iaq__marker" aria-hidden="true" />
              </button>
            </h3>
            <div
              id={`${askRowId}-panel`}
              role="region"
              aria-labelledby={`${askRowId}-button`}
              className="iaq__panel"
              data-open={isAskOpen || undefined}
            >
              <div className="iaq__panel-inner">
                <form className="iaq__form" onSubmit={handleSubmit}>
                  <label className="iaq__label" htmlFor={`${askRowId}-input`}>
                    {placeholder}
                  </label>
                  <div className="iaq__field">
                    <input
                      id={`${askRowId}-input`}
                      ref={inputRef}
                      className="iaq__input"
                      type="text"
                      value={draft}
                      maxLength={500}
                      autoComplete="off"
                      placeholder={placeholder}
                      onChange={(event) => setDraft(event.target.value)}
                      disabled={isAsking}
                    />
                    {hasButton && (
                      <button
                        type="submit"
                        className="iaq__submit"
                        disabled={isAsking || draft.trim().length === 0}
                      >
                        {isAsking ? 'Asking' : submitLabel}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </li>
        )}
      </ul>

      <p className="iaq__status" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

type AskStatusLike = AskedItem['status'] | undefined;

export default InfinitelyAskedQuestions;
