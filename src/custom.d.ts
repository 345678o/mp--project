declare global {
  namespace JSX {
    interface IntrinsicElements {
      'l-helix': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: string;
        speed?: string;
        color?: string;
      };
    }
  }
}

// Export an empty object to make this a module if it's not already.
// This can sometimes help with type recognition in some setups.
export {}; 