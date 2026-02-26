import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with primary styles by default', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toHaveClass('bg-action')
    expect(btn).not.toBeDisabled()
  })

  it('shows loading state and disables interaction', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Button loading onClick={handleClick}>
        Submit
      </Button>,
    )
    const btn = screen.getByRole('button', { name: /loading/i })
    expect(btn).toBeDisabled()
    await user.click(btn)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies secondary variant and size', () => {
    render(
      <Button variant="secondary" size="sm">
        Secondary
      </Button>,
    )
    const btn = screen.getByRole('button', { name: /secondary/i })
    expect(btn).toHaveClass('bg-surface-raised')
    expect(btn).toHaveClass('h-9')
  })
})
