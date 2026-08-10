import useOracleText from "../../../hooks/useOracleText";

const OracleText = ({ text, container = "p" }) => {
  const oracleText = useOracleText(text, container);

  return (
    <div >
      {oracleText}
    </div>
  )
};

export default OracleText;
