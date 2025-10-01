import { Button } from './button'
import { ClientExportOptions, exportToCsvFromClient } from '../lib/csv'
import { HardDriveDownload } from 'lucide-react'

interface ExportButtonProps<T extends object> extends ClientExportOptions<T> {
  disabled?: boolean
}

export default function ExportButton<T extends object>({ disabled, ...props }: ExportButtonProps<T>) {
  return (
    <Button
      variant={'outline'}
      disabled={disabled}
      className={'h-9 w-20'}
      onClick={() => exportToCsvFromClient(props)}
    >
      <HardDriveDownload />
      CSV
    </Button>
  )
}
