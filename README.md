## Material UI Cron

> A React cron editor built with [material ui](https://material-ui.com/)

[![npm package](https://img.shields.io/npm/v/material-ui-cron/latest.svg)](https://www.npmjs.com/package/material-ui-cron)
[![MIT License Badge](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/baymac/material-ui-cron/blob/master/LICENSE.md)

## Inspired by

- [react-cron-js](https://github.com/xrutayisire/react-js-cron)

## Installation

Be sure that you have these dependencies on your project:

- react (>=16.8.0)
- @material-ui/core (>=4.11.3)
- recoil (>=0.1.3)

```bash
# Yarn
yarn add material-ui-cron

# NPM
npm install --save material-ui-cron
```

## Usage

```javascript
function SchedulerDemo() {
  const [cronExp, setCronExp] = React.useState('0 0 * * *')
  const [cronError, setCronError] = React.useState('') // get error message if cron is invalid
  const [isAdmin, setIsAdmin] = React.useState(true) // set admin or non-admin to enable or disable high frequency scheduling (more than once a day)

  return (
    <RecoilRoot>
      <Scheduler
        cron={cronExp}
        setCron={setCronExp}
        setCronError={setCronError}
        isAdmin={isAdmin}
      />
    </RecoilRoot>
  )
}
```

## TypeScript

material-ui-cron is written in TypeScript with complete definitions

## License

MIT © [baymac](https://github.com/baymac)