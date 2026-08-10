import useOracleText from "../../../hooks/useOracleText";

const OracleText = ({ text, Component = "p" }) => {
  const oracleText = useOracleText(text, Component);

  return (
    <Component>
      {oracleText}
    </Component>
  )
};

export default OracleText;
