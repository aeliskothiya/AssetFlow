import { forwardRef, useCallback } from 'react';
import { CustomSelect } from './CustomSelect';

/**
 * Drop-in replacement for the old native <select> wrapper.
 *
 * It accepts children (<option> elements) and is fully compatible with
 * react-hook-form's register() — the forwarded ref points to a hidden
 * native <select> inside CustomSelect.
 */
export const Select = forwardRef(function Select(
  { label, className = '', error, children, value, onChange, ...props },
  ref,
) {
  // react-hook-form's register() passes onChange as a function that
  // expects an event. We need to convert the custom value-based
  // onChange to an event-based one for compatibility.
  const handleChange = useCallback(
    (newValue) => {
      if (typeof onChange === 'function') {
        // Check if this looks like an event handler from react-hook-form
        // (it accepts an event object, not a raw value). We create a
        // synthetic-like event that satisfies register()'s onChange.
        const syntheticEvent = {
          target: {
            name: props.name,
            value: newValue,
          },
          type: 'change',
        };
        onChange(syntheticEvent);
      }
    },
    [onChange, props.name],
  );

  return (
    <CustomSelect
      ref={ref}
      label={label}
      error={error}
      className={className}
      value={value}
      onChange={handleChange}
      name={props.name}
      onBlur={props.onBlur}
      disabled={props.disabled}
      {...(props.id ? { id: props.id } : {})}
    >
      {children}
    </CustomSelect>
  );
});
