// Input component with multiple variants for backward compatibility
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { ModernInput } from './InputModern';
import { ModernInputProps } from './InputModern';

// Create ref type for external access
export interface InputRef {
  focus(): void;
  blur(): void;
  clear(): void;
  isFocused(): boolean;
}

// Base input component (alias for ModernInput)
export const BaseInput = forwardRef<InputRef, ModernInputProps>((props, ref) => {
  const inputRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),  
    clear: () => inputRef.current?.clear(),
    isFocused: () => inputRef.current?.isFocused() || false,
  }));

  return <ModernInput ref={inputRef} {...props} />;
});

// Password input variant
export const PasswordInput = forwardRef<InputRef, Omit<ModernInputProps, 'secureTextEntry'>>((props, ref) => {
  return <BaseInput ref={ref} {...props} secureTextEntry />;
});

// Search input variant  
export const SearchInput = forwardRef<InputRef, Omit<ModernInputProps, 'leftIcon' | 'placeholder'>>((props, ref) => {
  return <BaseInput ref={ref} leftIcon="search" placeholder="Search..." {...props} />;
});

// Main Input component (default export)
export const Input = BaseInput;
export default Input;

// Export types
export type { ModernInputProps as InputProps };
export { ModernInput };