import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, UsersRound } from "lucide-react";
import { useAuth } from "@/features/auth/model/auth-context";
import { Button } from "@/shared/ui/button";
export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@peoplespace.com");
  const [password, setPassword] = useState("PeopleSpace@123");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <span className="brand-mark">
            <UsersRound size={21} />
          </span>
          <span>
            People<span>Space</span>
          </span>
        </div>
        <div className="story-content">
          <p className="eyebrow">WELCOME TO YOUR COMMUNITY</p>
          <h1>
            Better connections
            <br />
            start right here.
          </h1>
          <p>
            Discover inspiring people, shared interests, and new opportunities
            from around the world.
          </p>
          <div className="story-people">
            <span>AM</span>
            <span>JK</span>
            <span>RL</span>
            <strong>2,400+ people are waiting to connect</strong>
          </div>
        </div>
        <div className="story-orbit story-orbit--one" />
        <div className="story-orbit story-orbit--two" />
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-mobile-brand">
            <span className="brand-mark">
              <UsersRound size={20} />
            </span>
            <strong>
              People<span>Space</span>
            </strong>
          </div>
          <p className="eyebrow">MEMBER ACCESS</p>
          <h2>Welcome back</h2>
          <p className="login-intro">
            Sign in to continue exploring your global community.
          </p>
          <label className="form-field">
            <span>Email address</span>
            <div>
              <Mail size={18} />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
          </label>
          <label className="form-field">
            <span>Password</span>
            <div>
              <LockKeyhole size={18} />
              <input
                type={visible ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setVisible((value) => !value)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          <Button
            variant="primary"
            className="login-submit"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
          <div className="demo-note">
            <strong>Demo access</strong>
            <span>Credentials are pre-filled for your assessment.</span>
          </div>
        </form>
      </section>
    </main>
  );
}
