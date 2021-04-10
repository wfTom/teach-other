import { signIn, signOut, useSession } from 'next-auth/client'
import { NextPage } from 'next'
import Head from 'next/head'
import Nav from '../components/nav'

const AppPage: NextPage = () => {
  const [session, loading] = useSession()

  return (
    <div>
      <Nav />
      <h1>Bem vindo a página App</h1>
      {!session && (
        <>
          Not signed in <br />
          <button onClick={() => signIn('auth0')}>Sign in</button>
        </>
      )}
      {session && (
        <>
          Signed in as {session.user.email} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
      {loading && (
        <div>
          <h1>Carregando</h1>
        </div>
      )}
    </div>
  )
}

export default AppPage
