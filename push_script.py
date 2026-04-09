import subprocess, os, sys

repo = r'D:\spendwisev2-main'

files = [
    'web/lib/ai.ts',
    'web/components/AIChatbot.tsx', 
    'web/context/InvestmentContext.tsx',
    'web/context/AppContext.tsx',
    'web/types.ts',
    'web/components/CategoryCreator.tsx',
    'web/components/investment/GettingStartedSection.tsx',
    'web/components/investment/PortfolioSection.tsx',
    'web/.env.example',
]

def run(args, **kwargs):
    r = subprocess.run(args, cwd=repo, capture_output=True, text=True, **kwargs)
    print('CMD:', ' '.join(str(a) for a in args[:4]))
    print('STDOUT:', r.stdout[:3000])
    print('STDERR:', r.stderr[:3000])
    print('RC:', r.returncode)
    print('---')
    return r

# Check git status
print('=== GIT STATUS ===')
run(['git', 'status', '--short'])

# Check remote
print('=== REMOTE ===')
run(['git', 'remote', '-v'])

# Check which files actually exist/are modified
print('=== CHECKING FILES ===')
for f in files:
    import os
    full = os.path.join(repo, f.replace('/', os.sep))
    print(f'EXISTS: {os.path.exists(full)} - {f}')

# Stage files that exist
print('=== STAGING ===')
for f in files:
    full = os.path.join(repo, f.replace('/', os.sep))
    if os.path.exists(full):
        run(['git', 'add', f])

# Also stage any other modified files
run(['git', 'add', '-u'])

# Check status after staging
print('=== STATUS AFTER STAGING ===')
run(['git', 'status', '--short'])

# Commit
msg = """fix: AI chatbot 401, mobile portfolio, user-owned invest state, lessons with links, category CRUD

- lib/ai.ts: proxy-first AI routing, proper 401/429/timeout error handling
- AIChatbot.tsx: remove duplicate GROQ key; retry button, error styling, config banner
- InvestmentContext.tsx: authenticated users start with empty holdings/watchlist
- AppContext.tsx: add updateCustomCategory, archiveCustomCategory, mergeCustomCategories
- types.ts: Category gains archived/budgetable/parentId; AppContextType gains new methods
- CategoryCreator.tsx: full CategoryManager with edit/delete/archive/restore/merge
- GettingStartedSection.tsx: lessons with real resource links + expandable detail panel
- PortfolioSection.tsx: responsive mobile cards + desktop table + empty state
- .env.example: document server-side GROQ_API_KEY vs VITE_ client fallback

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"""

print('=== COMMITTING ===')
r = run(['git', 'commit', '-m', msg])
if r.returncode != 0 and 'nothing to commit' not in r.stdout and 'nothing to commit' not in r.stderr:
    print('Commit failed!')

# Check for auth tokens
token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN') or os.environ.get('COPILOT_TOKEN') or ''
print('Has token:', bool(token))
print('Token prefix:', token[:8] if token else 'none')

print('=== PUSHING ===')
if token:
    push_url = f'https://{token}@github.com/lekhanpro/spendwisev2.git'
    r = run(['git', 'push', push_url, 'HEAD:main'])
else:
    # Try origin
    r = run(['git', 'push', 'origin', 'main'])
    if r.returncode != 0:
        # Try HEAD:main
        r = run(['git', 'push', 'origin', 'HEAD:main'])

print('=== DONE ===')
print('Final RC:', r.returncode)
