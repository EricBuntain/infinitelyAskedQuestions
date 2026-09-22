
# (IFQs) Infinitely Asked Questions ♾️

A FAQ Block, that just goes on and on and on. ♾️
## Install

```bash
npm install
```

Set your key:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

Then put your project's facts in `api/context.ts`. That string is the only thing the model is allowed to answer from.
## Usage

```tsx
import { InfinitelyAskedQuestions } from './src/InfinitelyAskedQuestions';
import './src/iaq.css';

const faqs = [
  {
    id: 'timeline',
    question: 'How long does a build take?',
    answer: 'Most marketing sites land between four and eight weeks.',
    icon: <ClockIcon />, // optional, rendered before the question text
  },
  {
    id: 'cms',
    question: 'Do you work in WordPress?',
    answer: 'Yes, custom themes with ACF, plus headless builds on Contentful.',
  },
];

export function Faq() {
  return <InfinitelyAskedQuestions items={faqs} className="iaq--stylistic" />;
}
```![status](https://img.shields.io/badge/status-working-black)

thing the model is allowed to answer from.

## Usage

```tsx
import { InfinitelyAskedQuestions } from './src/InfinitelyAskedQuestions';
import './src/iaq.css';

const faqs = [
  {
    id: 'grossing',
    question: 'What's the highest-grossing horror movie?',
    answer: 'It (2017), at roughly $701 million worldwide. Adjusted for inflation the picture changes a lot: The Exorcist and Jaws both outperform it in real terms.',
    icon: <ClockIcon />, // optional, rendered before the question text
  },
  {
    id: 'conjuring',
    question: 'What is The Conjuring Universe, exactly?',
    answer: 'A shared horror franchise built around Ed and Lorraine Warren, the real-life paranormal investigators played by Patrick Wilson and Vera Farmiga',
  },
];

export function Faq() {
  return <InfinitelyAskedQuestions items={faqs} className="iaq--stylistic" />;
}
```

`iaq--stylistic` is a look shipped in `iaq.css`: dark rounded cards, icons, animated spotlights. Leave `className` off for a plain accordion matching the fixed rows exactly, or write your own class to style it from scratch.

### FaqItem

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` |  |
| `question` | `string` |  |
| `answer` | `string` |  |
| `icon` | `ReactNode` | Optional. Rendered before the question text |

### Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `items` | `FaqItem[]` | required | Your fixed questions, in order |
| `endpoint` | `string` | `/api/ask` | Where to POST `{ question }` |
| `className` | `string` | | Extra class on the root element. Pass `iaq--stylistic` for the built-in styled look |
| `askInline` | `boolean` | `false` | `false` - a plain accordion: click the row to reveal the input. `true` - the ask row is always open as an inline, terminal-style input |
| `showAskButton` | `boolean` | opposite of `askInline` | Show an explicit submit button. When `false`, pressing Enter is the only way to submit |
| `thinkingAnimation` | `boolean` | `false` | While a submitted question is streaming, add a `.thinking` class to that row |
| `askPrompt` | `string` | `Ask your own question` | Button label when `askInline` is `false`; input placeholder when `true` |
| `placeholder` | `string` | `What do you want to know?` | Input placeholder when `askInline` is `false`; screen-reader label when `true` |
| `submitLabel` | `string` | `Ask` | Submit button text. Only used when `showAskButton` is `true` |
| `onAsk` | `(q: string) => void` | | Fires per submission. Wire it to analytics |

## Theming

Styles ship deliberately plain. Override the custom properties:

```css
.iaq {
  --iaq-accent: #c7442e;
  --iaq-rule: #e4e0d8;
  --iaq-radius: 4px;
  --iaq-gap: 1.25rem;
  --iaq-duration: 180ms;
}
```

## Known gaps

- No rate limiting.
- Asked questions reset on reload. Persisting them is the obvious next
  step, and it turns the list into a real research signal.
- No streaming markdown. Answers render as plain text with preserved
  line breaks.

