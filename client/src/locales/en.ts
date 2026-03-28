export const language = {
  metadata: {
    name: 'English',
    code: 'en',
    codes: ['en', 'en-US', 'en-GB'],
    emoji: '🇬🇧',
  },
  main: {
    title: 'Plugin Registration Queue',
    description: 'Is Plugin Registration available?',
  },
  nav: {
    yourName: 'Your name',
    hideLog: 'Hide log',
    hideUptime: 'Hide uptime',
    audioMode: 'Tobias mode',
    godmodePw: 'Godmode password',
    language: 'Language',
    reportPrompt: 'Want to report a bug or suggest a feature?',
    createIssue: 'Create an issue here',
    username: 'Name',
  },
  banner: 'Is Plugin Registration available?',
  availability: {
    available: 'Available',
    unavailable: 'Unavailable',
  },
  queue: {
    takeOver: 'Take over',
    joinQueue: 'Join queue',
    imDone: "I'm done",
    leaveQueue: 'Leave queue',
  },
  queueDisplay: {
    bookedUntil: 'Booked until',
    estimated: 'Estimated',
    hourEstimate: (n: number) => `${n} hour${n === 1 ? '' : 's'}`,
  },
  exitModal: {
    line1: 'Are you sure you want to remove',
    line2: 'from the queue?',
    confirm: 'Confirm',
    fallbackUser: 'this user',
  },
  history: {
    title: 'History',
  },
  login: {
    title: 'Log in',
    namePlaceholder: 'Your name',
    submit: 'Log in',
    loggingIn: 'Logging in...',
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
  },
}

export type Language = typeof language
