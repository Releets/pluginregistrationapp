export const language = {
  meta: {
    title: 'Plugin Registration Queue',
    description: 'Is Plugin Registration available?',
  },
  nav: {
    yourName: 'Your name',
    hideLog: 'Hide log',
    tobiasMode: 'Tobias mode',
    godmode: 'Godmode password',
    language: 'Language',
    reportPrompt: 'Want to report a bug or suggest a feature?',
    createIssue: 'Create an issue here',
  },
  languages: {
    en: 'English',
    no: 'Norwegian',
    nl: 'Dutch',
  },
  banner: 'Is Plugin Registration available?',
  availability: {
    available: 'Available',
    unavailable: 'Unavailable',
  },
  queue: {
    durationOptions: [
      '1 hour',
      '2 hours',
      '3 hours',
      '4 hours',
      '5 hours',
      '6 hours',
      '7 hours',
      '8 hours',
    ],
    takeOver: 'Take over',
    joinQueue: 'Join queue',
    imDone: "I'm done",
    leaveQueue: 'Leave queue',
  },
  queueDisplay: {
    bookedUntil: 'Booked until',
    estimated: 'Estimated',
    hourEstimate: {
      one: '{{n}} hour',
      other: '{{n}} hours',
    },
  },
  exitModal: {
    line1: 'Are you sure you want to remove',
    line2: 'from the queue?',
    confirm: 'Confirm',
    fallbackUser: 'this user',
  },
  history: {
    title: 'Log',
  },
  login: {
    title: 'Log in',
    namePlaceholder: 'Your name',
    submit: 'Log in',
  },
  alerts: {
    tabsLoadFailed: 'Could not load tabs from the server',
    addToQueueFailed: 'Could not join the queue',
    removeFromQueueFailed: 'Could not remove you from the queue',
  },
  errors: {
    nameTooLong: 'Name is too long',
    loginFailed: 'Could not log in',
    activeTabRequired: 'No active tab to remove you from the queue',
    mustBeLoggedInToLeave: 'You must be logged in to leave the queue',
    missingPrivateKey: 'Missing private key to leave the queue',
  },
}

export type Language = typeof language
