type Props = {
  result: { success: boolean; message: string; data?: any } | null;
};

export default function ResultMessage({ result }: Props) {
  if (!result) return null;

  return (
    <div
      style={{
        marginTop: "1rem",
        color: result.success ? "green" : "red",
        userSelect: "text",
      }}
    >
      <strong>{result.success ? "Success:" : "Error:"}</strong> {result.message}
      {result.success && result.data && (
        <pre>{JSON.stringify(result.data, null, 2)}</pre>
      )}
    </div>
  );
}
