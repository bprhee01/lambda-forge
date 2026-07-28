import type { World } from '../types'

/**
 * Original learning content inspired by the chapter arc of
 * Functional Programming in Scala (Chiusano & Bjarnason).
 * Not a copy of the book — write your own solutions as you study.
 */
export const worlds: World[] = [
  {
    id: 'pure-craft',
    chapter: 1,
    title: 'What Is FP?',
    subtitle: 'Purity, referential transparency, and side effects',
    theme: 'The forge heats only when the metal stays pure.',
    quests: [
      {
        id: 'c1-purity',
        title: 'Spot the Impure',
        blurb: 'Learn to recognize side effects that break referential transparency.',
        xp: 40,
        challenges: [
          {
            id: 'c1-purity-1',
            kind: 'multiple-choice',
            prompt:
              'Which property means an expression can be replaced by its value without changing the program’s meaning?',
            choices: [
              'Polymorphism',
              'Referential transparency',
              'Type erasure',
              'Lazy evaluation',
            ],
            correctIndex: 1,
            explanation:
              'Referential transparency is the hallmark of purity: expressions equal their results everywhere.',
          },
          {
            id: 'c1-purity-2',
            kind: 'spot-bug',
            prompt:
              'One of these “functions” is impure. Tap the line that performs a side effect.',
            lines: [
              'def double(n: Int): Int =',
              '  n * 2',
              '',
              'def shout(msg: String): String = {',
              '  println(msg)  // ← ?',
              '  msg.toUpperCase',
              '}',
            ],
            buggyLine: 4,
            explanation:
              'println mutates the outside world (the console). That breaks referential transparency.',
          },
          {
            id: 'c1-purity-3',
            kind: 'true-false',
            prompt:
              'A pure function may throw an exception when given invalid input.',
            correct: false,
            explanation:
              'Throwing is a side effect / non-local control flow. In FP we usually return Option, Either, or similar.',
          },
          {
            id: 'c1-purity-4',
            kind: 'fill-blank',
            prompt: 'Complete this pure Scala function that adds two ints.',
            template: 'def add(a: Int, b: Int): Int = ___',
            acceptedAnswers: ['a + b', 'a+b', '(a + b)', '(a+b)'],
            placeholder: 'expression',
            explanation: 'Just return the sum — no printing, no mutation, no I/O.',
          },
        ],
      },
      {
        id: 'c1-rt',
        title: 'Substitution Game',
        blurb: 'Practice substituting expressions for their values.',
        xp: 50,
        challenges: [
          {
            id: 'c1-rt-1',
            kind: 'multiple-choice',
            prompt:
              'Given `val x = 2 + 3`, which rewrite is valid under referential transparency?',
            choices: [
              'Replace every `x` with `println(5)`',
              'Replace every `x` with `5`',
              'Replace every `x` with `2 + 3 + random()`',
              'Never replace `x`; vals are opaque',
            ],
            correctIndex: 1,
            explanation:
              'Because `2 + 3` is pure, `x` and `5` are interchangeable.',
          },
          {
            id: 'c1-rt-2',
            kind: 'true-false',
            prompt:
              'If `f(x)` is referentially transparent, calling it twice with the same `x` must yield the same result.',
            correct: true,
            explanation:
              'Same inputs → same outputs, with no observable side effects. That’s purity.',
          },
          {
            id: 'c1-rt-3',
            kind: 'multiple-choice',
            prompt: 'Why do FP programmers distrust `var` for core logic?',
            choices: [
              'Scala cannot compile `var`',
              'Mutation makes reasoning and substitution harder',
              '`var` is slower than `val` always',
              '`var` only works inside objects',
            ],
            correctIndex: 1,
            explanation:
              'Local mutation can be contained, but shared mutable state breaks easy equational reasoning.',
          },
        ],
      },
    ],
  },
  {
    id: 'getting-started',
    chapter: 2,
    title: 'Getting Started',
    subtitle: 'Higher-order functions, polymorphism, and loops as recursion',
    theme: 'Loops become recursion; functions become values.',
    quests: [
      {
        id: 'c2-hof',
        title: 'Higher-Order Heat',
        blurb: 'Pass functions as values and return them from functions.',
        xp: 55,
        challenges: [
          {
            id: 'c2-hof-1',
            kind: 'fill-blank',
            prompt: 'Fill the blank so `applyTwice` applies `f` two times.',
            template:
              'def applyTwice[A](f: A => A, a: A): A =\n  f(___)',
            acceptedAnswers: ['f(a)', '(f(a))'],
            scalaSnippet: 'def applyTwice[A](f: A => A, a: A): A = f(f(a))',
            explanation: '`f(f(a))` — compose the function with itself on the value.',
          },
          {
            id: 'c2-hof-2',
            kind: 'multiple-choice',
            prompt: 'What is the type of `(x: Int) => x > 0`?',
            choices: ['Int', 'Boolean', 'Int => Boolean', '() => Int'],
            correctIndex: 2,
            explanation: 'It takes an Int and returns a Boolean — a function type.',
          },
          {
            id: 'c2-hof-3',
            kind: 'true-false',
            prompt:
              'In Scala, `def` methods and function values (`val f = …`) are exactly the same at the type level.',
            correct: false,
            explanation:
              'Methods are not values until eta-expanded (e.g. `foo _` or `foo(_)`). Function values have types like `A => B`.',
          },
          {
            id: 'c2-hof-4',
            kind: 'multiple-choice',
            prompt: 'Polymorphic function `def identity[A](a: A): A` means…',
            choices: [
              'It only works for type `Any`',
              'The caller chooses `A`; the body cannot invent a different type',
              'It erases `A` at runtime so returns null',
              'It must pattern-match on `A`',
            ],
            correctIndex: 1,
            explanation:
              'Parametric polymorphism: one implementation that works uniformly for every `A`.',
          },
        ],
      },
      {
        id: 'c2-tail',
        title: 'Tail Recursion Forge',
        blurb: 'Turn loops into stack-safe recursive functions.',
        xp: 60,
        challenges: [
          {
            id: 'c2-tail-1',
            kind: 'fill-blank',
            prompt: 'Complete the recursive factorial (not necessarily tail-recursive yet).',
            template:
              'def fact(n: Int): Int =\n  if (n <= 1) 1 else n * ___(n - 1)',
            acceptedAnswers: ['fact', 'fact '],
            explanation: 'Classic recursion: `n * fact(n - 1)`.',
          },
          {
            id: 'c2-tail-2',
            kind: 'multiple-choice',
            prompt: 'A tail-recursive call is one where…',
            choices: [
              'The recursive call is the very last action of the function',
              'The function calls itself at least twice',
              'The function uses `@inline`',
              'The recursive call happens inside a `map`',
            ],
            correctIndex: 0,
            explanation:
              'When the recursive call is in tail position, Scala can reuse the stack frame (`@tailrec`).',
          },
          {
            id: 'c2-tail-3',
            kind: 'spot-bug',
            prompt:
              'This factorial claims to be tail-recursive but isn’t. Which line breaks tail position?',
            lines: [
              'def fact(n: Int): Int = {',
              '  def go(k: Int, acc: Int): Int =',
              '    if (k <= 1) acc',
              '    else k * go(k - 1, acc)  // problem?',
              '  go(n, 1)',
              '}',
            ],
            buggyLine: 3,
            explanation:
              '`k * go(...)` does work after the recursive call. Accumulators fix this: `go(k - 1, k * acc)`.',
          },
          {
            id: 'c2-tail-4',
            kind: 'true-false',
            prompt:
              '`@tailrec` makes the compiler error if a method is not actually tail-recursive.',
            correct: true,
            explanation:
              'That’s exactly why we annotate: to get a compile-time guarantee of stack safety.',
          },
        ],
      },
    ],
  },
  {
    id: 'data-structures',
    chapter: 3,
    title: 'Functional Data',
    subtitle: 'Lists, trees, folds, and algebraic data types',
    theme: 'Data is built from sums and products — then folded.',
    quests: [
      {
        id: 'c3-list',
        title: 'List Algebra',
        blurb: 'Pattern-match on Cons and Nil; think recursively.',
        xp: 65,
        challenges: [
          {
            id: 'c3-list-1',
            kind: 'multiple-choice',
            prompt: 'A Scala `List` is best described as…',
            choices: [
              'A mutable array under the hood you should update in place',
              'An algebraic data type: Nil or Cons(head, tail)',
              'Only usable with for-comprehensions',
              'A linked list that shares no structure',
            ],
            correctIndex: 1,
            explanation:
              'Immutable lists are ADTs. Pattern matching on Nil / Cons (or `::`) is the natural way to recurse.',
          },
          {
            id: 'c3-list-2',
            kind: 'fill-blank',
            prompt: 'Fill in the length of a list using recursion.',
            template:
              'def length[A](as: List[A]): Int = as match {\n  case Nil => 0\n  case _ :: t => 1 + ___(t)\n}',
            acceptedAnswers: ['length', 'length '],
            explanation: 'Count 1 for the head, then recurse on the tail.',
          },
          {
            id: 'c3-list-3',
            kind: 'multiple-choice',
            prompt: 'What does `foldRight` typically express?',
            choices: [
              'Mutation of each element from left to right',
              'Replacing the list constructors Nil/Cons with a value and a combining function',
              'Sorting the list',
              'Parallel evaluation only',
            ],
            correctIndex: 1,
            explanation:
              'Fold is structure recursion: Nil → z, Cons(h,t) → f(h, fold(t)).',
          },
          {
            id: 'c3-list-4',
            kind: 'true-false',
            prompt:
              '`List(1,2,3).map(_ + 1)` allocates a new list; the original is unchanged.',
            correct: true,
            explanation: 'Immutability: transformations return new structures (often sharing tails).',
          },
        ],
      },
      {
        id: 'c3-tree',
        title: 'Tree Recursion',
        blurb: 'Branching structures need branching recursion.',
        xp: 55,
        challenges: [
          {
            id: 'c3-tree-1',
            kind: 'fill-blank',
            prompt: 'Complete `size` for a binary tree ADT.',
            template:
              'sealed trait Tree[+A]\ncase class Leaf[A](value: A) extends Tree[A]\ncase class Branch[A](l: Tree[A], r: Tree[A]) extends Tree[A]\n\ndef size[A](t: Tree[A]): Int = t match {\n  case Leaf(_) => 1\n  case Branch(l, r) => size(l) + ___(r)\n}',
            acceptedAnswers: ['size', 'size '],
            explanation: 'Both branches contribute: `size(l) + size(r)`.',
          },
          {
            id: 'c3-tree-2',
            kind: 'multiple-choice',
            prompt: 'Why seal the `Tree` trait?',
            choices: [
              'To make it serializable',
              'So the compiler can check pattern matches for exhaustiveness',
              'To allow mutation of leaves',
              'Sealing is required for generics',
            ],
            correctIndex: 1,
            explanation:
              '`sealed` keeps subtypes in one file; matches warn if a case is missing.',
          },
          {
            id: 'c3-tree-3',
            kind: 'true-false',
            prompt:
              '`map` on a tree should transform leaf values while preserving the tree’s shape.',
            correct: true,
            explanation: 'That’s the usual functor intuition for tree-shaped data.',
          },
        ],
      },
    ],
  },
  {
    id: 'errors',
    chapter: 4,
    title: 'Errors Without Exceptions',
    subtitle: 'Option, Either, and total functions',
    theme: 'Failures become values you can compose.',
    quests: [
      {
        id: 'c4-option',
        title: 'Option Rising',
        blurb: 'Replace null and thrown exceptions with Option.',
        xp: 70,
        challenges: [
          {
            id: 'c4-option-1',
            kind: 'multiple-choice',
            prompt: '`Option[A]` is a container that is either…',
            choices: [
              'Some(value) or None',
              'Success or Failure',
              'Left or Right',
              'Try or Catch',
            ],
            correctIndex: 0,
            explanation: 'Option models presence/absence. Either is for typed errors; Try wraps exceptions.',
          },
          {
            id: 'c4-option-2',
            kind: 'fill-blank',
            prompt: 'Safe reciprocal: return None when n is 0.',
            template:
              'def reciprocal(n: Double): Option[Double] =\n  if (n == 0) ___ else Some(1 / n)',
            acceptedAnswers: ['None', 'None '],
            explanation: '`None` signals “no reciprocal,” without throwing.',
          },
          {
            id: 'c4-option-3',
            kind: 'multiple-choice',
            prompt: 'What does `opt.map(f)` do when `opt` is `None`?',
            choices: [
              'Calls `f` with null',
              'Returns `None` without calling `f`',
              'Throws NoSuchElementException',
              'Returns `Some(f())`',
            ],
            correctIndex: 1,
            explanation: 'Map lifts `f` into the Option context; empty stays empty.',
          },
          {
            id: 'c4-option-4',
            kind: 'true-false',
            prompt:
              '`flatMap` on Option is needed when your function already returns an Option.',
            correct: true,
            explanation:
              '`map` would nest `Option[Option[A]]`; `flatMap` flattens the composition.',
          },
          {
            id: 'c4-option-5',
            kind: 'spot-bug',
            prompt: 'Which line reintroduces an unsafe partial function?',
            lines: [
              'def parseInt(s: String): Option[Int] =',
              '  try Some(s.toInt) catch { case _: NumberFormatException => None }',
              '',
              'val n = parseInt("nope").get  // ← ?',
              'println(n)',
            ],
            buggyLine: 3,
            explanation:
              '`.get` throws when empty — undoing the safety Option gave you. Prefer `getOrElse`, folds, or for-comps.',
          },
        ],
      },
      {
        id: 'c4-either',
        title: 'Either Hand',
        blurb: 'Carry an error message (or type) on the Left.',
        xp: 55,
        challenges: [
          {
            id: 'c4-either-1',
            kind: 'multiple-choice',
            prompt: 'By convention in Scala FP, `Either[E, A]` uses…',
            choices: [
              'Left for success, Right for error',
              'Right for success, Left for error',
              'Both sides for success',
              'Only Right; Left is deprecated',
            ],
            correctIndex: 1,
            explanation: 'Right-biased Either: map/flatMap operate on the Right (success) side.',
          },
          {
            id: 'c4-either-2',
            kind: 'fill-blank',
            prompt: 'Fail with a message when age is negative.',
            template:
              'def nonNegative(age: Int): Either[String, Int] =\n  if (age < 0) Left(___) else Right(age)',
            acceptedAnswers: [
              '"age must be >= 0"',
              "'age must be >= 0'",
              '"negative age"',
              '"invalid age"',
            ],
            placeholder: 'error message string',
            explanation: 'Any clear Left message works; the type tracks failure explicitly.',
          },
          {
            id: 'c4-either-3',
            kind: 'true-false',
            prompt:
              'For-comprehensions over Option/Either desugar to `flatMap` and `map`.',
            correct: true,
            explanation: 'That’s how sequential composition of effects (including failure) stays readable.',
          },
        ],
      },
    ],
  },
  {
    id: 'laziness',
    chapter: 5,
    title: 'Strictness & Laziness',
    subtitle: 'Lazy lists, thunks, and incremental computation',
    theme: 'Compute only what the forge needs — when it needs it.',
    quests: [
      {
        id: 'c5-lazy',
        title: 'Thunk Workshop',
        blurb: 'Understand by-name params and lazy evaluation.',
        xp: 60,
        challenges: [
          {
            id: 'c5-lazy-1',
            kind: 'multiple-choice',
            prompt: 'A by-name parameter `x: => A` means…',
            choices: [
              'x is evaluated once when the method is defined',
              'x is re-evaluated each time it is referenced in the body',
              'x must be a lazy val',
              'x is always a function value of type () => A at the call site',
            ],
            correctIndex: 1,
            explanation:
              'By-name args are thunks: the expression is passed unevaluated and run on each use (unless you cache it).',
          },
          {
            id: 'c5-lazy-2',
            kind: 'true-false',
            prompt: '`lazy val` memoizes: the initializer runs at most once.',
            correct: true,
            explanation: 'First access computes and caches; later accesses reuse the result.',
          },
          {
            id: 'c5-lazy-3',
            kind: 'multiple-choice',
            prompt: 'Why do lazy streams shine for large/infinite sequences?',
            choices: [
              'They mutate in place faster than arrays',
              'They compute elements on demand and can fuse transformations',
              'They disable the garbage collector',
              'They only work with Int',
            ],
            correctIndex: 1,
            explanation:
              'Laziness + fusion lets you express pipelines without building huge intermediate lists.',
          },
          {
            id: 'c5-lazy-4',
            kind: 'fill-blank',
            prompt: 'Force the first element of a LazyList (Scala 2.13+).',
            template: 'val ones: LazyList[Int] = 1 #:: ones\nval head = ones.___',
            acceptedAnswers: ['head', 'head '],
            explanation: 'Accessing `head` forces only what’s needed for that element.',
          },
        ],
      },
    ],
  },
  {
    id: 'state',
    chapter: 6,
    title: 'Functional State',
    subtitle: 'RNG and State as functions of the world you thread through',
    theme: 'State is a value you pass — not a hidden mutable cell.',
    quests: [
      {
        id: 'c6-rng',
        title: 'Random Without Vars',
        blurb: 'Model RNG as (value, nextRng) pairs.',
        xp: 70,
        challenges: [
          {
            id: 'c6-rng-1',
            kind: 'multiple-choice',
            prompt: 'A pure RNG API typically returns…',
            choices: [
              'Only the random Int, mutating an internal seed',
              'A pair: (result, nextRng)',
              'Unit after printing the number',
              'A Future[Int]',
            ],
            correctIndex: 1,
            explanation:
              'Returning the next generator keeps the transition pure and explicit.',
          },
          {
            id: 'c6-rng-2',
            kind: 'true-false',
            prompt:
              'If you reuse the same RNG instance for two calls, you can get the same “random” output twice.',
            correct: true,
            explanation:
              'Purity means same seed → same sequence. You must thread the updated RNG forward.',
          },
          {
            id: 'c6-rng-3',
            kind: 'fill-blank',
            prompt: 'Type alias often used for state transitions:',
            template: 'type State[S, A] = S => (___, S)',
            acceptedAnswers: ['A', '(A)', 'A '],
            explanation: '`State[S,A]` is a function from state to (result, new state).',
          },
          {
            id: 'c6-rng-4',
            kind: 'multiple-choice',
            prompt: '`map` on `State[S, A]` lets you…',
            choices: [
              'Change A without altering how S is threaded',
              'Discard the state entirely',
              'Convert S into a different state type automatically',
              'Run the state in parallel',
            ],
            correctIndex: 0,
            explanation:
              'Map transforms the output value; the state-passing skeleton stays intact.',
          },
        ],
      },
    ],
  },
  {
    id: 'monoids-monads',
    chapter: 10,
    title: 'Monoids & Monads',
    subtitle: 'Algebraic structure that scales composition',
    theme: 'Laws turn patterns into reliable tools.',
    quests: [
      {
        id: 'c10-monoid',
        title: 'Monoid Laws',
        blurb: 'Associativity + identity: the smallest useful algebra.',
        xp: 65,
        challenges: [
          {
            id: 'c10-monoid-1',
            kind: 'multiple-choice',
            prompt: 'A monoid needs…',
            choices: [
              'Only a zero element',
              'An associative binary op and an identity element',
              'map and flatMap',
              'An inverse for every element',
            ],
            correctIndex: 1,
            explanation:
              'Monoid = (op, zero) with associativity and left/right identity. Groups also need inverses.',
          },
          {
            id: 'c10-monoid-2',
            kind: 'true-false',
            prompt: 'String concatenation with `""` forms a monoid.',
            correct: true,
            explanation: '`(a + b) + c = a + (b + c)` and `""` is the identity.',
          },
          {
            id: 'c10-monoid-3',
            kind: 'fill-blank',
            prompt: 'Identity element for integer addition monoid:',
            template: 'val intAdditionZero: Int = ___',
            acceptedAnswers: ['0', '0 '],
            explanation: 'Adding zero changes nothing.',
          },
          {
            id: 'c10-monoid-4',
            kind: 'multiple-choice',
            prompt: 'Why fold a list with a monoid?',
            choices: [
              'Because lists only store monoids',
              'The monoid tells you how to combine elements and what empty means',
              'Monoids sort automatically',
              'It avoids using generics',
            ],
            correctIndex: 1,
            explanation: '`foldLeft(zero)(op)` is exactly “collapse with monoid.”',
          },
        ],
      },
      {
        id: 'c11-monad',
        title: 'Monad Intuition',
        blurb: 'flatMap sequences computations in a context.',
        xp: 75,
        challenges: [
          {
            id: 'c11-monad-1',
            kind: 'multiple-choice',
            prompt: 'The essence of a monad (for programmers) is…',
            choices: [
              'A type constructor with `map` only',
              'A type constructor F with `unit`/`pure` and `flatMap` (with laws)',
              'Any class with a `get` method',
              'Syntax sugar for inheritance',
            ],
            correctIndex: 1,
            explanation:
              '`pure` lifts a value; `flatMap` chains context-aware steps. Laws keep refactoring safe.',
          },
          {
            id: 'c11-monad-2',
            kind: 'true-false',
            prompt: 'Every monad is also a functor (you can derive `map` from `flatMap` + `pure`).',
            correct: true,
            explanation: '`map(fa)(f) = flatMap(fa)(a => pure(f(a)))`.',
          },
          {
            id: 'c11-monad-3',
            kind: 'fill-blank',
            prompt: 'Sequence two Options — blank should be flatMap.',
            template:
              'def both[A, B](oa: Option[A], ob: Option[B]): Option[(A, B)] =\n  oa.___(a => ob.map(b => (a, b)))',
            acceptedAnswers: ['flatMap', 'flatMap '],
            explanation: 'flatMap sequences; if `oa` is None, the rest never runs.',
          },
          {
            id: 'c11-monad-4',
            kind: 'multiple-choice',
            prompt: 'Which is NOT typically “monadic” sequencing?',
            choices: [
              'Option failing fast on None',
              'Either short-circuiting on Left',
              'List non-deterministic bind',
              'Adding two Ints with `+`',
            ],
            correctIndex: 3,
            explanation:
              'Plain Int addition is a monoid (or just arithmetic), not effect sequencing via flatMap.',
          },
          {
            id: 'c11-monad-5',
            kind: 'spot-bug',
            prompt: 'Which line violates the spirit of monadic composition?',
            lines: [
              'def loadUser(id: Int): Option[User] = …',
              'def loadPrefs(u: User): Option[Prefs] = …',
              '',
              'val u = loadUser(1).get',
              'val p = loadPrefs(u).get',
            ],
            buggyLine: 3,
            explanation:
              '`.get` escapes the Option context. Prefer `loadUser(1).flatMap(loadPrefs)` or a for-comprehension.',
          },
        ],
      },
    ],
  },
]

export function getWorld(worldId: string): World | undefined {
  return worlds.find((w) => w.id === worldId)
}

export function getQuest(
  worldId: string,
  questId: string,
): { world: World; quest: (typeof worlds)[0]['quests'][0] } | undefined {
  const world = getWorld(worldId)
  if (!world) return undefined
  const quest = world.quests.find((q) => q.id === questId)
  if (!quest) return undefined
  return { world, quest }
}

export function totalQuests(): number {
  return worlds.reduce((n, w) => n + w.quests.length, 0)
}

export function totalXpAvailable(): number {
  return worlds.reduce(
    (n, w) => n + w.quests.reduce((qSum, q) => qSum + q.xp, 0),
    0,
  )
}
