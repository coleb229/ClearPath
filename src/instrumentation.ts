export async function register() {
  // Ensure Prisma query engine binary is found on Vercel.
  // Set the env var so Prisma looks in the correct bundled location.
  if (process.env.VERCEL && process.env.NEXT_RUNTIME === "nodejs") {
    const { join } = await import("node:path");
    const engineDir = join(process.cwd(), "src/generated/prisma");
    process.env.PRISMA_QUERY_ENGINE_LIBRARY ??= join(
      engineDir,
      "libquery_engine-rhel-openssl-3.0.x.so.node"
    );
  }
}
