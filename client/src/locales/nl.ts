import type { Language } from './en'

export const language: Language = {
  meta: {
    title: 'Plugin Registration-wachtrij',
    description: 'Is Plugin Registration beschikbaar?',
  },
  nav: {
    yourName: 'Je naam',
    hideLog: 'Log verbergen',
    tobiasMode: 'Tobias-modus',
    godmodePassword: 'Godmode-wachtwoord',
    language: 'Taal',
    reportPrompt: 'Wil je een bug melden of een suggestie doen?',
    createIssue: 'Maak hier een issue aan',
  },
  languages: {
    en: 'Engels',
    no: 'Noors',
    nl: 'Nederlands',
  },
  banner: 'Is Plugin Registration beschikbaar?',
  availability: {
    available: 'Beschikbaar',
    unavailable: 'Niet beschikbaar',
  },
  queue: {
    durationOptions: [
      '1 uur',
      '2 uur',
      '3 uur',
      '4 uur',
      '5 uur',
      '6 uur',
      '7 uur',
      '8 uur',
    ],
    takeOver: 'Overnemen',
    joinQueue: 'In de wachtrij',
    imDone: 'Ik ben klaar',
    leaveQueue: 'Wachtrij verlaten',
  },
  queueDisplay: {
    bookedUntil: 'Geboekt tot',
    estimated: 'Geschat',
    hourEstimate: {
      one: '{{n}} uur',
      other: '{{n}} uur',
    },
  },
  exitModal: {
    line1: 'Weet je zeker dat je',
    line2: 'uit de wachtrij wilt halen?',
    confirm: 'Bevestigen',
    fallbackUser: 'deze gebruiker',
  },
  history: {
    title: 'Logboek',
  },
  login: {
    title: 'Inloggen',
    namePlaceholder: 'Je naam',
    submit: 'Inloggen',
  },
  alerts: {
    tabsLoadFailed: 'Kan tabbladen niet van de server laden',
    addToQueueFailed: 'Kon niet in de wachtrij',
    removeFromQueueFailed: 'Kon je niet uit de wachtrij halen',
  },
  errors: {
    nameTooLong: 'Naam is te lang',
    loginFailed: 'Inloggen mislukt',
    activeTabRequired: 'Geen actief tabblad om je uit de wachtrij te halen',
    mustBeLoggedInToLeave: 'Je moet ingelogd zijn om de wachtrij te verlaten',
    missingPrivateKey: 'Privésleutel ontbreekt om de wachtrij te verlaten',
  },
}
