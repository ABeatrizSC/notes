import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps { //componente recebe a propriedade onNoteCreated, uma função que recebe o parâmetro de nome content e não possui retorno
    onNoteCreated: (textContent: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) { //Acesso às propriedades do onNoteCreated
    const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [textContent, setTextContent] = useState('')

    function handleStartEditor() {
        setShouldShowOnBoarding(false)
    }

    function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
        setTextContent(event.target.value) //Toda vez que houver mudanças no conteúdo de texto, o estado de content será mudado pelo valor/texto digitado pelo usuário

        if (event.target.value === '') {
            setShouldShowOnBoarding(true)
        }
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault() //previnir comportamento padrão do submit

        if (textContent === '') {
            return toast.error('A nota não pode ser salva em branco')
        }

        onNoteCreated(textContent)
        setShouldShowOnBoarding(true)
        setTextContent('')

        toast.success('Nota criada com sucesso!')
    }

    function handleStartRecording() {
        //checando a disponibilidade da API no navegador através da presença do nome da classe da API
        const isSpeechRecognitionAPIAvaliable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

        if (!isSpeechRecognitionAPIAvaliable) {
            alert('Infelizmente o seu navegador não suporta a API de gravação! Tente em outro.')
            return
        }

        setIsRecording(true) //quando estiver gravando
        setShouldShowOnBoarding(false) //não mostrar on boarding

        const speechRecognitionAPI = window.SpeechRecognition|| window.webkitSpeechRecognition

        speechRecognition = new speechRecognitionAPI()

        speechRecognition.lang = 'pt-BR'
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 1
        speechRecognition.interimResults = true

        //preenche o texto da nota com a gravação de voz
        speechRecognition.onresult = (event) => {

            //todo o texto que o usuario falou
            const transcription = Array.from(event.results).reduce((text, result) => { //converte qualquer tipo de iterator para array
                return text.concat(result[0].transcript)//concatenação do texto até obter o texto completo -> result[0] pois sempre haverá apenas 1 alternativa (maxAlternatives = 1)
            }, '') //valor inicial

            setTextContent(transcription)
        }

        speechRecognition.onerror = (event) => {
            console.error(event)
        }

        speechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        if (speechRecognition !== null) {
            speechRecognition.stop()
        }
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className='rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400'>
                <span className='text-sm font-medium text-slate-200'>Adicionar nota</span>
                <p className='text-sm leading-6 text-slate-400'>Grave uma nota em áudio que será convertida para texto automaticamente.</p>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className='inset-0 fixed bg-black/50'/>
                <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[68vh] bg-slate-700 rounded-md flex flex-col outline-none'>
                    <Dialog.Close className='absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
                        <X className='size-5'/>
                    </Dialog.Close>
                    <form className='flex-1 flex flex-col'>
                        <div className='flex flex-1 flex-col gap-3 p-5'>
                            <span 
                                className='text-sm font-medium text-slate-200'>
                                Adicionar nota
                            </span>

                            {shouldShowOnBoarding ? (
                                <p className='text-sm leading-6 text-slate-400'>
                                    Comece <button type='button' onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'> gravando uma nota </button> em áudio ou se preferir <button type='button' onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'> utilize apenas texto</button>.
                                </p>
                            ) : (
                                <textarea autoFocus className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none' onChange={handleContentChanged} value={textContent}/>
                            )}
                        </div>

                        {isRecording ? (
                            <button
                                type="button" 
                                onClick={handleStopRecording} 
                                className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:bg-slate-800'>
                                <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
                                Gravando! (Clique aqui p/ interromper)
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                onClick={handleSaveNote}
                                className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'>
                                Salvar nota
                            </button>
                        )}
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}