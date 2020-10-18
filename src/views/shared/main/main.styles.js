import { createUseStyles } from 'react-jss'

const useMainStyles = createUseStyles(theme => ({
  main: {
    flex: 1,
    display: 'flex',
    width: '100%',
    marginTop: theme.headerHeight
  }
}))

export default useMainStyles
