# LoadingAnimation Component

A reusable loading animation component that displays engaging progress messages with visual indicators to make waiting times feel shorter and more interactive.

## Features

- **Customizable progress steps** - Define your own progress messages
- **Multiple variants** - Purple, blue, green, orange, and default themes
- **Size options** - Small, medium, and large sizes
- **Progress bar** - Optional visual progress indicator
- **Time estimates** - Optional time estimate text
- **Dark mode support** - All variants work in both light and dark modes
- **Accessible** - Proper contrast and readable text

## Usage Examples

### Basic Usage

```tsx
import { LoadingAnimation } from "@/components/common";

<LoadingAnimation />;
```

### AI Recommendation Loading (Long Duration)

````tsx
const AI_STEPS = [
  "Analyzing your preferences...",
  "Finding similar movies...",
  "Searching through thousands of films...",
  "Generating recommendations...",
  "Adding detailed explanations...",
  "Almost ready...",
];

<LoadingAnimation
  steps={AI_STEPS}
  variant="purple"
  timeEstimate="This usually takes 25-35 seconds"
  estimatedDuration={30000} // 30 seconds
  preventReset={true} // Prevent progress bar from resetting
  showIcon={false} // Hide icon for cleaner look
/>;

### File Upload Loading

```tsx
const UPLOAD_STEPS = [
  "Preparing file...",
  "Uploading...",
  "Processing...",
  "Finalizing...",
];

<LoadingAnimation
  steps={UPLOAD_STEPS}
  variant="blue"
  timeEstimate="Upload will complete shortly"
  size="sm"
/>;
````

### Data Fetching

```tsx
const FETCH_STEPS = [
  "Connecting to server...",
  "Retrieving data...",
  "Processing results...",
];

<LoadingAnimation
  steps={FETCH_STEPS}
  variant="green"
  showProgressBar={false}
  showTimeEstimate={false}
/>;
```

## Props

| Prop                | Type                                                     | Default                                                | Description                                                |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| `steps`             | `string[]`                                               | `["Processing...", "Almost done...", "Finalizing..."]` | Array of progress messages to cycle through                |
| `stepInterval`      | `number`                                                 | `1500`                                                 | Milliseconds between step changes                          |
| `showProgressBar`   | `boolean`                                                | `true`                                                 | Whether to show the progress bar                           |
| `showTimeEstimate`  | `boolean`                                                | `true`                                                 | Whether to show the time estimate text                     |
| `timeEstimate`      | `string`                                                 | `"This usually takes a few seconds"`                   | Custom time estimate text                                  |
| `variant`           | `"default" \| "purple" \| "blue" \| "green" \| "orange"` | `"default"`                                            | Color theme variant                                        |
| `size`              | `"sm" \| "md" \| "lg"`                                   | `"md"`                                                 | Size variant                                               |
| `className`         | `string`                                                 | `""`                                                   | Additional CSS classes                                     |
| `estimatedDuration` | `number`                                                 | `undefined`                                            | Estimated duration in milliseconds for time-based progress |
| `preventReset`      | `boolean`                                                | `false`                                                | Prevent progress bar from resetting when steps cycle       |
| `showIcon`          | `boolean`                                                | `true`                                                 | Whether to show the icon next to the progress message      |

## Variants

### Default (Gray)

- Background: Slate gradient
- Text: Slate colors
- Progress: Slate gradient

### Purple

- Background: Purple to pink gradient
- Text: Purple colors
- Progress: Purple to pink gradient

### Blue

- Background: Blue to indigo gradient
- Text: Blue colors
- Progress: Blue to indigo gradient

### Green

- Background: Green to emerald gradient
- Text: Green colors
- Progress: Green to emerald gradient

### Orange

- Background: Amber to orange gradient
- Text: Amber colors
- Progress: Amber to orange gradient

## Sizes

### Small (`sm`)

- Padding: `p-4`
- Text: `text-sm`
- Dots: `w-1.5 h-1.5`
- Icon: `w-4 h-4`
- Time text: `text-xs`

### Medium (`md`) - Default

- Padding: `p-6`
- Text: `text-base`
- Dots: `w-2 h-2`
- Icon: `w-5 h-5`
- Time text: `text-xs`

### Large (`lg`)

- Padding: `p-8`
- Text: `text-lg`
- Dots: `w-2.5 h-2.5`
- Icon: `w-6 h-6`
- Time text: `text-sm`

## Best Practices

1. **Keep steps concise** - Each step should be 1-3 words
2. **Use consistent timing** - 1-2 seconds per step works well for short operations
3. **For long operations** - Use `estimatedDuration` and `preventReset` to prevent progress bar resets
4. **Match variant to context** - Use purple for AI features, blue for data operations, etc.
5. **Provide accurate time estimates** - Help users set expectations
6. **Consider accessibility** - Ensure good contrast ratios
7. **Add more steps for longer operations** - Prevents cycling too fast and keeps users engaged

## Implementation Details

- Uses React hooks (`useState`, `useEffect`) for state management
- Automatically cleans up intervals to prevent memory leaks
- Responsive design with Tailwind CSS
- TypeScript support with proper typing
- Follows the single responsibility principle
