import ObituaryItem from "./ObituaryItem";
import Empty from "./Empty";

function Obituaries({ obituaries, showDefault }) {
  const sortedObituaries = obituaries.sort((a, b) => a.id - b.id);

  return sortedObituaries.length > 0 ? (
    <div className="obituaries-list">
      {sortedObituaries.map((obituary) => (
        <ObituaryItem key={obituary.id} obituary={obituary} defaultExpanded={showDefault}/>
      ))}
    </div>
  ) : (
    <Empty />
  );
}

export default Obituaries;