interface DialogContentSectionHeaderProps {
    text: string;
}

export default function DialogContentSectionHeader({text}: Readonly<DialogContentSectionHeaderProps>) {
    return (
        <span className="font-sans text-[10px] text-(--color-white-3) uppercase">
          {text}
        </span>
    );
}
