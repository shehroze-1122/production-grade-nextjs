import React, { FC, useState } from 'react'
import { Pane, Dialog, majorScale } from 'evergreen-ui'
import { useRouter } from 'next/router'
import { useSession, getSession } from 'next-auth/client'

import Logo from '../../components/logo'
import FolderList from '../../components/folderList'
import NewFolderButton from '../../components/newFolderButton'
import User from '../../components/user'
import FolderPane from '../../components/folderPane'
import DocPane from '../../components/docPane'
import NewFolderDialog from '../../components/newFolderDialog'
import { folder, doc } from '../../db'
import { connectToDB } from '../../db'
import { AppProps, UserSession } from '../../types'

const App: FC<AppProps> = ({
  folders,
  activeDoc,
  activeFolder,
  activeDocs,
  session
}) => {

  
  const router = useRouter()
  const [ newFolderIsShown, setIsShown ] = useState(false)
  const [ allFolders, setAllFolders ] = useState(folders || [])
  const [ _, loading ] = useSession();

  const Page = () => {
    if (activeDoc) {
      return <DocPane folder={activeFolder} doc={activeDoc} />
    }

    if (activeFolder) {
      return <FolderPane folder={activeFolder} docs={activeDocs} />
    }

    return null
  }

  const handleNewFolder = async (name: string) =>{
    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/folder`, {
      method: 'POST', 
      body: JSON.stringify({name}),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const { data } = await resp.json()
    setAllFolders(state=>[...state, data])
  }

  if(loading){
    return null;
  }

  if (!loading && !session) {
    return (
      <Dialog
        isShown
        title="Session expired"
        confirmLabel="Ok"
        hasCancel={false}
        hasClose={false}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEscapePress={false}
        onConfirm={() => router.push('/signin')}
      >
        Sign in to continue
      </Dialog>
    )
  }

  return (
    <Pane position="relative">
      <Pane width={300} position="absolute" top={0} left={0} background="tint2" height="100vh" borderRight>
        <Pane padding={majorScale(2)} display="flex" alignItems="center" justifyContent="space-between">
          <Logo />

          <NewFolderButton onClick={() => setIsShown(true)} />
        </Pane>
        <Pane>
          <FolderList folders={allFolders} />{' '}
        </Pane>
      </Pane>
      <Pane marginLeft={300} width="calc(100vw - 300px)" height="100vh" overflowY="auto" position="relative">
        <User user={session.user} />
        <Page />
      </Pane>
      <NewFolderDialog close={() => setIsShown(false)} isShown={newFolderIsShown} onNewFolder={handleNewFolder} />
    </Pane>
  )
}

App.defaultProps = {
  folders: [],
}

export async function getServerSideProps(ctx){

  const session: { user?: UserSession } = await getSession(ctx);

  if(!session || !session.user){
    return {
      props: {
        session: session
      }
    }
  }
  const { db } = await connectToDB()
  const folders = await folder.getFolders(db, session.user.id)
  const props: AppProps = { session }
  
  props.folders = folders

  if(ctx.params.id ){
    props.activeFolder = folders.find((folder)=>folder._id === ctx.query.id[0])
    props.activeDocs = await doc.getDocsByFolder(db, props.activeFolder._id)

    if(ctx.params.id.length>1){
      props.activeDoc = props.activeDocs.find((doc)=>doc._id===ctx.query.id[1])
    }
  }

  return {
    props
  }

}

/**
 * Catch all handler. Must handle all different page
 * states.
 * 1. Folders - none selected
 * 2. Folders => Folder selected
 * 3. Folders => Folder selected => Document selected
 *
 * An unauth user should not be able to access this page.
 *
 * @param context
 */
export default App
