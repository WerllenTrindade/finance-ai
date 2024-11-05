import Image from "next/image"
import { Button } from "../_components/ui/button"
import { LogsIcon } from "lucide-react"

const LoginPage = () => {
    return (
        <div className="grid h-full grid-cols-2 ">
            {/* ESQUERDA */}
            <div className="flex flex-col h-full justify-center p-8 max-w-[550px]">
                <Image src="/logo.svg" width={173} height={39} alt="Finance AI" className="mb-8" />
                <h1 className="text-4xl font-bold mb-3 mb-8">Bem-vindo</h1>
                <p className="text-muted-foreground">A Finance AI é uma plataforma de gestão financeira que utiliza IA para monitorar suas movimentações, e oferecer insights personalizados, facilitando o controle do seu orçamento.</p>
                <Button variant="outline">
                    <LogsIcon className="mr-2" />
                    Fazer login ou criar conta</Button>
            </div>
            {/* DIREITA */}
            <div className="relative h-full w-full">
                <Image
                    src="decorative.png"
                    fill
                    className="object-cover"
                    alt="Faça seu Login" />
            </div>
        </div>
    )
}

export default LoginPage