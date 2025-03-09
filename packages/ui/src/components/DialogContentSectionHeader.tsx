interface DialogContentSectionHeaderProps {
    text: string;
}

export default function DialogContentSectionHeader({text}: Readonly<DialogContentSectionHeaderProps>) {
    return (
        <span className="font-[var(--font-sans)] text-[10px] text-[var(--color-white-3)] uppercase">
          {text}
        </span>
    );
}
