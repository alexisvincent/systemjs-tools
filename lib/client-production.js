export const passiveInit = () => {
  return {
    config: {
      protocol: 'https://',
      port: 7777,
      hostname: window.location.hostname
    },
    connect: () => {
    }
  }
}

export const connect = () => {
  return passiveInit()
}
