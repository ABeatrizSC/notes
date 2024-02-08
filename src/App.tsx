import { ChangeEvent, useState } from 'react'
import logo from './assets/logo-nlw-expert.svg'
import { NewNoteCard } from './components/new-note-card'
import { NoteCard } from './components/note-card'
import { toast } from 'sonner'

interface Note { //tudo o que há em uma nota
  id: string
  date: Date
  textContent: string
}

export function App() {
  const [search, setSearch] = useState('')

  //estado de notas -> mudará conforme a informação é mudada:
  const [notes, setNotes] = useState<Note[]>(() => { //este array de estado de notas, terá o formato da interface Note
    const notesOnStorage = localStorage.getItem('notes') //variável recebe o que foi salvo em localstorage

    if (notesOnStorage) { //se houver notas salvas
      return JSON.parse(notesOnStorage) //caminho contrário ao stringfy, para retornar o array de notas salvo em localstorage
    }

    return []
  })

  function onNoteCreated(textContent: string) {
    const newNote = {
      id: crypto.randomUUID(), //ID unico universal em formato de string 
      date: new Date(), 
      textContent //virá do parâmetro
    }

    /* No react, nunca se altera uma informaçao salva no estado, CRIA-SE uma informação nova
    
    Para adicionar uma nova Nota nesse array, é necessario criar um array com todas as notas que ja se tem e add uma nova */
    
    const notesArray = [newNote, ...notes] //adiciona uma nova nota / copia todas as notas

    setNotes(notesArray) 

    localStorage.setItem('notes', JSON.stringify(notesArray)) //salvando as informações das notas em local storage. Necessita conversao de array para string/texto
  }

  function onNoteDeleted(id: string) {
    const notesArray = notes.filter( note => { //cria-se um array filtrado, em que só serão inseridas notas com id diferente do passado por parâmetro
      return note.id !== id
    })

    setNotes(notesArray) //salva no estado
    localStorage.setItem('notes', JSON.stringify(notesArray)) //salva no localstorage
    toast.success('Nota apagada!')
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value //valor da busca

    setSearch(query) //salva dentro do estado da busca
  }

  const filteredNotes = search !== '' //se a busca for diferente de ''
    ? notes.filter(note => note.textContent.toLocaleLowerCase().includes(search.toLocaleLowerCase())) //entao retone notas filtradas, onde o conteudo de texto da nota esta incluido com o que foi buscado
    : notes //se nao, retorne todas as notas

  return (
    <div className='mx-auto max-w-6xl my-12 space-y-6 px-5 xl:px-0'>
      <img src={logo} alt='NWL Expert' />
      <form className='w-full'>
        <input 
          type="text" 
          placeholder='Busque em suas notas..'
          className='w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-slate-500'
          onChange={handleSearch}
        />
      </form>

      <div className='h-px bg-slate-700' />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[250px] gap-6'>
        <NewNoteCard onNoteCreated={onNoteCreated}/>

        {filteredNotes.map(note => { //como o estado notes é um array, percorre-se cada elemento dele: 
          return <NoteCard key={note.id} note={note} onNoteDeleted={onNoteDeleted}/> //retorna um NoteCard com as informações que vêm do objeto
        })}
      </div>
    </div>
  )
}

