import { signIn, signOut, useSession } from 'next-auth/client'
import { NextPage } from 'next'
import Head from 'next/head'
import Nav from '../components/nav'

const IndexPage: NextPage = () => {
  const [session, loading] = useSession()

  return (
    <div>
      <Nav />
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

export default IndexPage
