import Image from 'next/image'

export default function Logo() {
    return (
        <div className="flex items-center">
            <Image src="/svgs/logo.svg" alt="SneakLab Logo" width={50} height={50} className="mr-2" />
            <span className="text-xl font-bold text-primary-foreground">SneakLab</span>
        </div>
    )
}