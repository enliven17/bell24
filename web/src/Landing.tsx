import Splash from './components/Splash'
import Nav from './sections/Nav'
import Hero from './sections/Hero'
import Proof from './sections/Proof'
import Statement from './sections/Statement'
import GapScrub from './sections/GapScrub'
import Audience from './sections/Audience'
import Agent from './sections/Agent'
import Rules from './sections/Rules'
import Footer from './sections/Footer'

export default function Landing() {
  return (
    <>
      <Splash />
      <Nav />
      <main>
        <Hero />
        <Proof />
        <Statement />
        <GapScrub />
        <Audience />
        <Agent />
        <Rules />
      </main>
      <Footer />
    </>
  )
}
