import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from '../Input'

describe('Input', () => {
  it('renders label and helper text', async () => {
    render(<Input label="Name" helperText="Enter your name" />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Enter your name')).toBeInTheDocument()
    const input = screen.getByLabelText('Name')
    expect(input).toBeEnabled()
    await userEvent.type(input, 'Alice')
    expect((input as HTMLInputElement).value).toBe('Alice')
  })

  it('shows error message and disabled styles', () => {
    render(<Input label="Email" error="Invalid" disabled />)
    const input = screen.getByLabelText('Email')
    expect(screen.getByText('Invalid')).toBeInTheDocument()
    expect(input).toBeDisabled()
    expect(input).toHaveClass('cursor-not-allowed')
  })
})
