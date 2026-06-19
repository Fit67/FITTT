'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─── Input — VITRAPRO rounded style ─────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:    string
  hint?:     string
  error?:    string
  leading?:  React.ReactNode
  trailing?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leading, trailing, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leading && (
            <span className="pointer-events-none absolute left-3 text-gray-400 dark:text-gray-500">
              {leading}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-transparent px-3.5 py-2.5',
              'font-body text-sm text-gray-900 placeholder:text-gray-400',
              'dark:text-gray-100 dark:placeholder:text-gray-600',
              'outline-none transition-colors duration-150',
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-gray-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-500',
              leading  && 'pl-10',
              trailing && 'pr-10',
              className,
            )}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 text-gray-400 dark:text-gray-500">{trailing}</span>
          )}
        </div>

        {(hint || error) && (
          <p className={cn('text-xs', error ? 'text-red-500' : 'text-gray-400 dark:text-gray-500')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

// ─── Select ────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?:  string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-lg border bg-transparent px-3.5 py-2.5 pr-9',
            'font-body text-sm text-gray-900 dark:text-gray-100',
            'outline-none appearance-none transition-colors duration-150',
            'dark:bg-gray-900',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-500',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {(hint || error) && (
          <p className={cn('text-[11px] font-light', error ? 'text-red-500' : 'text-gray-400')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  },
)
Select.displayName = 'Select'

// ─── Textarea ──────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?:  string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const textId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textId} className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textId}
          rows={4}
          className={cn(
            'w-full resize-none border bg-transparent px-3.5 py-2.5',
            'font-body text-sm text-gray-900 placeholder:text-gray-400',
            'dark:text-gray-100 dark:placeholder:text-gray-600',
            'outline-none transition-colors duration-150',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-500',
            className,
          )}
          {...props}
        />
        {(hint || error) && (
          <p className={cn('text-xs', error ? 'text-red-500' : 'text-gray-400 dark:text-gray-500')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

// ─── Checkbox ──────────────────────────────────────────────────
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:       string
  description?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const checkId = id ?? generatedId

    return (
      <div className="flex gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={checkId}
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 cursor-pointer border-gray-300',
            'accent-red-600 dark:accent-red-500',
            className,
          )}
          {...props}
        />
        {(label || description) && (
          <label htmlFor={checkId} className="cursor-pointer">
            {label && (
              <span className="block text-sm text-gray-800 dark:text-gray-200">{label}</span>
            )}
            {description && (
              <span className="block text-xs text-gray-500 dark:text-gray-400">{description}</span>
            )}
          </label>
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'
