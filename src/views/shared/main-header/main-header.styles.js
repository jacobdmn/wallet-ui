import { createUseStyles } from 'react-jss'

const useMainHeaderStyles = createUseStyles(theme => ({
  root: {
    width: '100%',
    position: 'fixed',
    height: theme.headerHeight,
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.primary.main
  },
  headerContent: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    textDecoration: 'none',
    color: 'currentColor',
    display: 'flex'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  linkText: {
    fontWeight: theme.fontWeights.bold,
    whiteSpace: 'nowrap'
  },
  myAccountIcon: {
    marginLeft: -(theme.spacing(1)),
    marginRight: theme.spacing(1.5)
  }
}))

export default useMainHeaderStyles