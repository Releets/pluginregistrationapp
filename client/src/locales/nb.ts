import type { Language } from './en'

export const language: Language = {
  metadata: {
    name: 'Norsk',
    code: 'nb',
    codes: ['no', 'nb', 'nn', 'nb-NO', 'nn-NO'],
    emoji: '🇳🇴',
  },
  main: {
    title: 'Plugin Registration-kø',
    description: 'Er Plugin Registration ledig?',
  },
  nav: {
    yourName: 'Ditt navn',
    hideLog: 'Skjul logg',
    hideUptime: 'Skjul oppetid',
    audioMode: 'Tobias-modus',
    godmodePw: 'Godmode-passord',
    language: 'Språk',
    reportPrompt: 'Vil du rapportere en feil eller foreslå en funksjon?',
    createIssue: 'Opprett et issue',
    username: 'Navn',
  },
  banner: 'Er Plugin Registration ledig?',
  availability: {
    available: 'Ledig',
    unavailable: 'Opptatt',
  },
  queue: {
    durationOptions: ['1 time', '2 timer', '3 timer', '4 timer', '5 timer', '6 timer', '7 timer', '8 timer'],
    takeOver: 'Overta',
    joinQueue: 'Gå i kø',
    imDone: 'Jeg er ferdig',
    leaveQueue: 'Forlat køen',
  },
  queueDisplay: {
    bookedUntil: 'Booket til',
    estimated: 'Estimert',
    hourEstimate: {
      one: '{{n}} time',
      other: '{{n}} timer',
    },
  },
  exitModal: {
    line1: 'Er du sikker på at du vil trekke',
    line2: 'fra køen?',
    confirm: 'Bekreft',
    fallbackUser: 'denne brukeren',
  },
  history: {
    title: 'Logg',
  },
  login: {
    title: 'Logg inn',
    namePlaceholder: 'Ditt navn',
    submit: 'Logg inn',
    loggingIn: 'Logger inn...',
  },
  alerts: {
    tabsLoadFailed: 'Kunne ikke hente faner fra serveren',
    addToQueueFailed: 'Kunne ikke gå i køen',
    removeFromQueueFailed: 'Kunne ikke fjerne deg fra køen',
  },
  errors: {
    nameTooLong: 'Navn er for langt',
    loginFailed: 'Kunne ikke logge inn',
    activeTabRequired: 'Mangler aktiv fane for å fjerne deg fra køen',
    mustBeLoggedInToLeave: 'Du må være logget inn for å forlate køen',
  },
}
