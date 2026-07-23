type LoginFormProps = {
  error?: string;
};

export function LoginForm({ error }: LoginFormProps) {
  return (
    <form action="/api/auth/login" method="post" className="space-y-4">
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue="admin@alnentregas.local"
          placeholder="admin@alnentregas.local"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">Senha</label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Sua senha"
        />
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <button className="btn btn-primary w-full" type="submit">
        Entrar no painel
      </button>
    </form>
  );
}
