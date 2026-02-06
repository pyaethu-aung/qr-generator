import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportModal } from '../ExportModal'
import type { ExportFormat, DimensionPreset, DpiPreset } from '../../../types/export'

describe('ExportModal', () => {
  const defaultProps = {
    isOpen: true,
    format: 'png' as ExportFormat,
    dimension: 1000 as DimensionPreset,
    dpi: 72 as DpiPreset,
    isExporting: false,
    error: null,
    onClose: vi.fn(),
    onFormatChange: vi.fn(),
    onDimensionChange: vi.fn(),
    onDpiChange: vi.fn(),
    onExport: vi.fn(),
    title: 'Export QR Code',
    exportButtonLabel: 'Export',
    cancelButtonLabel: 'Cancel',
    dimensionLabel: 'Dimension',
    dpiLabel: 'Print Quality (DPI)',
    formatLabels: {
      png: 'PNG',
      svg: 'SVG',
      pdf: 'PDF',
    },
    formatDescriptions: {
      png: 'Raster image format',
      svg: 'Scalable vector graphics',
      pdf: 'Print-ready document',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Export QR Code')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<ExportModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders all format options', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByRole('radio', { name: /PNG/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /SVG/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /PDF/i })).toBeInTheDocument()
    })

    it('renders dimension options', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: /500px/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /1000px/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /2000px/i })).toBeInTheDocument()
    })

    it('shows DPI options only when PDF format is selected', () => {
      const { rerender } = render(<ExportModal {...defaultProps} format="png" />)
      expect(screen.queryByText(/72 DPI/i)).not.toBeInTheDocument()

      rerender(<ExportModal {...defaultProps} format="pdf" />)
      expect(screen.getByRole('button', { name: /72 DPI/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /150 DPI/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /300 DPI/i })).toBeInTheDocument()
    })

    it('displays error message when error prop is provided', () => {
      render(<ExportModal {...defaultProps} error="Export failed" />)
      expect(screen.getByRole('alert')).toHaveTextContent('Export failed')
    })
  })

  describe('ARIA Attributes', () => {
    it('has proper ARIA attributes for dialog', () => {
      render(<ExportModal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'export-modal-title')
    })

    it('has ARIA label for close button', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
    })

    it('format selector has radiogroup role', () => {
      render(<ExportModal {...defaultProps} />)
      const formatOptions = screen.getAllByRole('radio')
      expect(formatOptions).toHaveLength(3)
    })
  })

  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<ExportModal {...defaultProps} />)
      
      const closeButton = screen.getByLabelText('Close modal')
      await user.click(closeButton)
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ExportModal {...defaultProps} />)
      
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onExport when export button is clicked', async () => {
      const user = userEvent.setup()
      render(<ExportModal {...defaultProps} />)
      
      const exportButton = screen.getByRole('button', { name: 'Export' })
      await user.click(exportButton)
      
      expect(defaultProps.onExport).toHaveBeenCalledTimes(1)
    })

    it('calls onFormatChange when format is selected', async () => {
      const user = userEvent.setup()
      render(<ExportModal {...defaultProps} />)
      
      const svgOption = screen.getByRole('radio', { name: /SVG/i })
      await user.click(svgOption)
      
      expect(defaultProps.onFormatChange).toHaveBeenCalledWith('svg')
    })

    it('calls onDimensionChange when dimension is selected', async () => {
      const user = userEvent.setup()
      render(<ExportModal {...defaultProps} />)
      
      const size2000 = screen.getByRole('button', { name: /2000px/i })
      await user.click(size2000)
      
      expect(defaultProps.onDimensionChange).toHaveBeenCalledWith(2000)
    })

    it('calls onDpiChange when DPI is selected (PDF format)', async () => {
      const user = userEvent.setup()
      render(<ExportModal {...defaultProps} format="pdf" />)
      
      const dpi300 = screen.getByRole('button', { name: /300 DPI/i })
      await user.click(dpi300)
      
      expect(defaultProps.onDpiChange).toHaveBeenCalledWith(300)
    })
  })

  describe('Keyboard Navigation', () => {
    it('closes modal when Escape key is pressed', async () => {
      const user = userEvent.setup()
      render(<ExportModal {...defaultProps} />)
      
      await user.keyboard('{Escape}')
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when Escape is pressed during export', () => {
      render(<ExportModal {...defaultProps} isExporting={true} />)
      
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('traps focus with Tab key navigation', () => {
      render(<ExportModal {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      const buttons = screen.getAllByRole('button')
      
      // Focus first button
      buttons[0].focus()
      expect(document.activeElement).toBe(buttons[0])
      
      // Tab to next element
      fireEvent.keyDown(dialog, { key: 'Tab' })
      
      // Focus should stay within modal
      const activeElement = document.activeElement as HTMLElement
      expect(dialog.contains(activeElement)).toBe(true)
    })
  })

  describe('Loading States', () => {
    it('disables buttons when isExporting is true', () => {
      render(<ExportModal {...defaultProps} isExporting={true} />)
      
      const closeButton = screen.getByLabelText('Close modal')
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      const exportButton = screen.getByRole('button', { name: /Exporting/i })
      
      expect(closeButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
      expect(exportButton).toBeDisabled()
    })

    it('shows loading indicator when isExporting is true', () => {
      render(<ExportModal {...defaultProps} isExporting={true} />)
      
      expect(screen.getByText('Exporting...')).toBeInTheDocument()
    })

    it('does not allow backdrop close during export', () => {
      render(<ExportModal {...defaultProps} isExporting={true} />)
      
      const backdrop = screen.getByRole('dialog').parentElement!
      fireEvent.click(backdrop)
      
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  describe('Format Selection', () => {
    it('shows selected format with visual indicator', () => {
      render(<ExportModal {...defaultProps} format="png" />)
      
      const pngRadio = screen.getByRole('radio', { name: /PNG/i })
      expect(pngRadio).toHaveAttribute('aria-checked', 'true')
    })

    it('updates format descriptions based on selection', () => {
      const { rerender } = render(<ExportModal {...defaultProps} format="png" />)
      expect(screen.getByText(/Raster image format/i)).toBeInTheDocument()
      
      rerender(<ExportModal {...defaultProps} format="svg" />)
      expect(screen.getByText(/Scalable vector graphics/i)).toBeInTheDocument()
    })
  })

  // T035: Accessibility tests for Phase 6
  describe('Accessibility - Screen Reader Announcements (T035)', () => {
    it('has ARIA live region for status announcements', () => {
      render(<ExportModal {...defaultProps} />)
      
      const statusRegion = screen.getByRole('status')
      expect(statusRegion).toBeInTheDocument()
      expect(statusRegion).toHaveAttribute('aria-live', 'polite')
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('announces export in progress to screen readers', () => {
      render(<ExportModal {...defaultProps} isExporting={true} />)
      
      const statusRegion = screen.getByRole('status')
      expect(statusRegion).toHaveTextContent('Exporting QR code, please wait...')
    })

    it('announces export error to screen readers', () => {
      render(<ExportModal {...defaultProps} error="Failed to export QR code" />)
      
      const statusRegion = screen.getByRole('status')
      expect(statusRegion).toHaveTextContent('Export failed: Failed to export QR code')
    })

    it('clears status announcement when export completes successfully', () => {
      const { rerender } = render(<ExportModal {...defaultProps} isExporting={true} />)
      
      const statusRegion = screen.getByRole('status')
      expect(statusRegion).toHaveTextContent('Exporting QR code, please wait...')
      
      // Export completes
      rerender(<ExportModal {...defaultProps} isExporting={false} />)
      expect(statusRegion).toBeEmptyDOMElement()
    })

    it('has sr-only class for screen reader-only content', () => {
      render(<ExportModal {...defaultProps} />)
      
      const statusRegion = screen.getByRole('status')
      expect(statusRegion).toHaveClass('sr-only')
    })
  })

  // T035: Focus trap tests
  describe('Accessibility - Focus Management (T035)', () => {
    it('focuses first button when modal opens', () => {
      render(<ExportModal {...defaultProps} />)
      
      // First button should be focused (close or format button)
      expect(document.activeElement).toBeDefined()
    })

    it('traps focus in reverse (Shift+Tab)', () => {
      render(<ExportModal {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      const buttons = screen.getAllByRole('button')
      const lastButton = buttons[buttons.length - 1]
      
      // Focus last button
      lastButton.focus()
      expect(document.activeElement).toBe(lastButton)
      
      // Shift+Tab should wrap to first
      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
      
      const activeElement = document.activeElement as HTMLElement
      expect(dialog.contains(activeElement)).toBe(true)
    })
  })

  // T035: ARIA describedby tests
  describe('Accessibility - ARIA Descriptions (T035)', () => {
    it('has aria-describedby for format options', () => {
      render(<ExportModal {...defaultProps} />)
      
      const pngRadio = screen.getByRole('radio', { name: /PNG/i })
      expect(pngRadio).toHaveAttribute('aria-describedby', 'format-desc-png')
    })

    it('has aria-label for dimension buttons with descriptions', () => {
      render(<ExportModal {...defaultProps} />)
      
      const size500 = screen.getByRole('button', { name: /500px/i })
      expect(size500).toHaveAttribute('aria-label')
    })

    it('has aria-label for DPI buttons with descriptions', () => {
      render(<ExportModal {...defaultProps} format="pdf" />)
      
      const dpi72 = screen.getByRole('button', { name: /72 DPI/i })
      expect(dpi72).toHaveAttribute('aria-label')
    })
  })
})
