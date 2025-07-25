import { ReactNode } from "react";

type Result = {
  success: boolean;
  message: string;
  data?: unknown;
};

type Props = {
  result: Result | null;
};

export default function ResultMessage({ result }: Props) {
  if (!result) return null;

  const renderData = (data: unknown): ReactNode => {
    if (typeof data === "string") {
      return <pre>{data}</pre>;
    }

    if (typeof data === "object" && data !== null) {
      return <pre>{JSON.stringify(data, null, 2)}</pre>;
    }

    return null;
  };

  return (
    <div
      style={{
        marginTop: "1rem",
        color: result.success ? "green" : "red",
        userSelect: "text",
      }}
    >
      <strong>{result.success ? "Success:" : "Error:"}</strong> {result.message}
      {result.success && result.data !== undefined && renderData(result.data)}
    </div>
  );
}
