let pyodide = null;

self.onmessage = async (event) => {
  const { type, code, stdin } = event.data || {};
  try {
    if (type === "init") {
      if (!pyodide) {
        importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");
        pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/" });
      }
      self.postMessage({ type: "ready" });
    }
    if (type === "run") {
      pyodide.globals.set("user_code", code);
      pyodide.globals.set("user_input", stdin || "");
      const result = await pyodide.runPythonAsync(`
import io, sys, traceback, contextlib
_out = io.StringIO()
_err = io.StringIO()
_old_stdin = sys.stdin
sys.stdin = io.StringIO(user_input)
_ok = True
try:
    with contextlib.redirect_stdout(_out), contextlib.redirect_stderr(_err):
        exec(compile(user_code, "<classroom-exercise>", "exec"), {"__name__": "__main__"})
except Exception:
    _ok = False
    traceback.print_exc(file=_err)
finally:
    sys.stdin = _old_stdin
{"stdout": _out.getvalue()[:60000], "stderr": _err.getvalue()[:20000], "ok": _ok}
      `);
      self.postMessage({ type: "result", result: result.toJs({ dict_converter: Object.fromEntries }) });
      result.destroy();
      pyodide.globals.delete("user_code");
      pyodide.globals.delete("user_input");
    }
  } catch (error) {
    self.postMessage({ type: "error", message: String(error) });
  }
};
