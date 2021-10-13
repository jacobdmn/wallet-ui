import { createUseStyles } from "react-jss";

const useAccountDetailsStyles = createUseStyles((theme) => ({
  root: {
    width: "100%",
  },
  section: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fiatBalance: {
    marginBottom: theme.spacing(3),
    "& span": {
      color: theme.palette.grey.dark,
      fontSize: theme.spacing(2.5),
      fontWeight: theme.fontWeights.medium,
    },
  },
  tokenBalance: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
}));

export default useAccountDetailsStyles;
