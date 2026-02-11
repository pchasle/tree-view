import styled from "styled-components";

export const HighlightText = ({
  text,
  query,
}: {
  text: string;
  query: string;
}) => {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <Highlight>{text.slice(index, index + query.length)}</Highlight>
      {text.slice(index + query.length)}
    </>
  );
};

const Highlight = styled.mark`
  background-color: yellow;
  font-weight: bold;
  border-radius: 2px;
`;
