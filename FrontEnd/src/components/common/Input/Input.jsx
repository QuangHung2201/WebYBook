import { forwardRef } from 'react';
import { cn } from '../../../shared/utils/cn';
import './Input.css';

export const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, className, id, name, ...rest },
  ref,
) {
  const inputId = id || name;
  return (
    <div className={cn('field', className)}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <div className={cn('input-wrap', Icon && 'input-wrap--icon')}>
        {Icon ? <Icon className="input-wrap__icon" size={17} aria-hidden="true" /> : null}
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={cn('input', error && 'invalid')}
          aria-invalid={Boolean(error)}
          {...rest}
        />
      </div>
      {error ? <span className="error">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, id, name, rows = 4, ...rest },
  ref,
) {
  const inputId = id || name;
  return (
    <div className={cn('field', className)}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <textarea
        ref={ref}
        id={inputId}
        name={name}
        rows={rows}
        className={cn('textarea', error && 'invalid')}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error ? <span className="error">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, hint, className, id, name, options = [], placeholder, children, ...rest },
  ref,
) {
  const inputId = id || name;
  return (
    <div className={cn('field', className)}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <select
        ref={ref}
        id={inputId}
        name={name}
        className={cn('select', error && 'invalid')}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      {error ? <span className="error">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
});

export default Input;
