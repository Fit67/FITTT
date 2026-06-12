'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─── Input — editorial flat style ─────────────────────────────
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
            className="text-[11px] font-light uppercase tracking-[0.1em] text-gray-500 dark:text-[#666]"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leading && (
            <span className="pointer-events-none absolute left-3 text-gray-400 dark:text-[#555]">
              {leading}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full border bg-transparent px-3.5 py-2.5',
              'font-body text-[13px] font-light text-gray-900 placeholder:text-gray-300',
              'dark:text-[#ccc] dark:placeholder:text-[#3a3a3a]',
              'outline-none transition-colors duration-150',
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-gray-200 dark:border-[#2a2a2a] focus:border-primary-500 dark:focus:border-[#c8822a]',
              leading  && 'pl-10',
              trailing && 'pr-10',
              className,
            )}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 text-gray-400 dark:text-[#555]">{trailing}</span>
          )}
        </div>

        {(hint || error) && (
          <p className={cn('text-[11px] font-light', error ? 'text-red-500' : 'text-gray-400 dark:text-[#555]')}>
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
          <label htmlFor={selectId} className="text-[11px] font-light uppercase tracking-[0.1em] text-gray-500 dark:text-[#666]">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full border bg-transparent px-3.5 py-2.5 pr-9',
            'font-body text-[13px] font-light text-gray-900 dark:text-[#ccc]',
            'outline-none appearance-none transition-colors duration-150',
            'dark:bg-[#0e0e0e]',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-200 dark:border-[#2a2a2a] focus:border-primary-500 dark:focus:border-[#c8822a]',
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
          <label htmlFor={textId} className="text-[11px] font-light uppercase tracking-[0.1em] text-gray-500 dark:text-[#666]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textId}
          rows={4}
          className={cn(
            'w-full resize-none border bg-transparent px-3.5 py-2.5',
            'font-body text-[13px] font-light text-gray-900 placeholder:text-gray-300',
            'dark:text-[#ccc] dark:placeholder:text-[#3a3a3a]',
            'outline-none transition-colors duration-150',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-200 dark:border-[#2a2a2a] focus:border-primary-500 dark:focus:border-[#c8822a]',
            className,
          )}
          {...props}
        />
        {(hint || error) && (
          <p className={cn('text-[11px] font-light', error ? 'text-red-500' : 'text-gray-400')}>
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
            'accent-primary-600 dark:accent-[#c8822a]',
            className,
          )}
          {...props}
        />
        {(label || description) && (
          <label htmlFor={checkId} className="cursor-pointer">
            {label && (
              <span className="block text-[13px] font-light text-gray-800 dark:text-[#ccc]">{label}</span>
            )}
            {description && (
              <span className="block text-[11px] font-light text-gray-500 dark:text-[#555]">{description}</span>
            )}
          </label>
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'
