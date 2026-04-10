#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: npm run create-talk <talk-name>"
  exit 1
fi

TALK_NAME="$1"
TALK_DIR="static/talks/$TALK_NAME"

if [ -d "$TALK_DIR" ]; then
  echo "Error: Talk '$TALK_NAME' already exists"
  exit 1
fi

mkdir -p "$TALK_DIR"

cat > "$TALK_DIR/index.html" << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TALK_TITLE</title>
    <link rel="stylesheet" href="https://unpkg.com/reveal.js@5.2.1/dist/reset.css">
    <link rel="stylesheet" href="https://unpkg.com/reveal.js@5.2.1/dist/reveal.css">
    <link rel="stylesheet" href="../slides.css">
  </head>
  <body>
    <div class="reveal">
      <div class="slides">

        <section>
          <h1>TALK_TITLE</h1>
          <aside class="notes">
            Speaker notes go here.
          </aside>
        </section>

        <section>
          <h2>Second Slide</h2>
          <p>Content goes here.</p>
        </section>

      </div>
    </div>

    <script src="https://unpkg.com/reveal.js@5.2.1/dist/reveal.js"></script>
    <script src="https://unpkg.com/reveal.js@5.2.1/plugin/highlight/highlight.js"></script>
    <script src="https://unpkg.com/reveal.js@5.2.1/plugin/notes/notes.js"></script>
    <script>
      Reveal.initialize({
        hash: true,
        plugins: [ RevealHighlight, RevealNotes ]
      });
    </script>
  </body>
</html>
EOF

# Replace placeholder with actual title
sed -i '' "s/TALK_TITLE/$TALK_NAME/g" "$TALK_DIR/index.html"

echo "Created talk: $TALK_DIR/index.html"
echo ""
echo "Next steps:"
echo "  1. Edit $TALK_DIR/index.html to add your slides"
echo "  2. Add entry to src/pages/talks/index.tsx"
echo "  3. Run 'npm start' and visit http://localhost:3000/talks/$TALK_NAME/"
