import type { World } from '../types'

/** Chapters 10–12 — Common structures in functional design */
export const part3: World[] = [
  {
    id: 'ch10-monoids',
    chapter: 10,
    title: 'Monoids',
    subtitle: 'Associative combine + identity element',
    theme: 'The smallest algebra that still scales.',
    overview:
      'A monoid is a type with an associative binary operation and an identity element. That tiny structure explains folding, parallel combination, and many “combine things” APIs.',
    quests: [
      {
        id: 'c10-laws',
        title: 'Monoid Laws',
        blurb: 'op and zero, with laws you can test.',
        xp: 65,
        lessons: [
          {
            heading: 'Definition',
            body: [
              'A monoid for type A needs: combine(a, b): A, and zero: A (the identity).',
              'Laws: combine is associative — combine(combine(a,b), c) = combine(a, combine(b,c)). And zero is identity on both sides.',
              'Examples: (Int, +, 0), (Int, *, 1), (String, +, ""), (List[A], ++, Nil), (Boolean, &&, true), (Boolean, ||, false), endofunctions A => A under compose with identity.',
            ],
            code: `trait Monoid[A] {
  def combine(a1: A, a2: A): A
  def empty: A
}

val intAddition: Monoid[Int] = new Monoid[Int] {
  def combine(a: Int, b: Int) = a + b
  def empty = 0
}

val stringMonoid: Monoid[String] = new Monoid[String] {
  def combine(a: String, b: String) = a + b
  def empty = ""
}

def combineAll[A](as: List[A])(M: Monoid[A]): A =
  as.foldLeft(M.empty)(M.combine)`,
            callout:
              'Associativity unlocks parallelism: you can split a list, fold both halves, then combine the partial results.',
          },
        ],
        challenges: [
          {
            id: 'c10-1',
            kind: 'multiple-choice',
            prompt: 'A monoid needs…',
            choices: [
              'Only a zero',
              'An associative binary op and an identity',
              'map and flatMap',
              'An inverse for every element',
            ],
            correctIndex: 1,
            explanation: 'Groups need inverses; monoids do not.',
          },
          {
            id: 'c10-2',
            kind: 'true-false',
            prompt: 'String concatenation with "" forms a monoid.',
            correct: true,
            explanation: 'Associative + empty string identity.',
          },
          {
            id: 'c10-3',
            kind: 'fill-blank',
            prompt: 'Identity for integer addition:',
            template: 'val intAdditionZero: Int = ___',
            acceptedAnswers: ['0'],
            explanation: 'Adding zero changes nothing.',
          },
          {
            id: 'c10-4',
            kind: 'multiple-choice',
            prompt: 'Why fold a list with a monoid?',
            choices: [
              'Lists only store monoids',
              'The monoid provides empty and how to combine elements',
              'Monoids sort automatically',
              'It avoids generics',
            ],
            correctIndex: 1,
            explanation: 'foldLeft(empty)(combine) is “collapse with monoid.”',
          },
        ],
      },
      {
        id: 'c10-foldable',
        title: 'Foldable Structures',
        blurb: 'Anything you can fold can use a monoid.',
        xp: 55,
        lessons: [
          {
            heading: 'foldMap',
            body: [
              'foldMap maps each element into a monoid and combines — great when the element type is not already the monoid type.',
              'Lists, trees, and Option can all be Foldable. That abstraction lets one algorithm work across structures.',
            ],
            code: `def foldMap[A, B](as: List[A], M: Monoid[B])(f: A => B): B =
  as.foldLeft(M.empty)((b, a) => M.combine(b, f(a)))

// Count words via foldMap into Int addition monoid
def wordCount(s: String): Int =
  foldMap(s.split("\\s+").toList.filter(_.nonEmpty), intAddition)(_ => 1)`,
          },
        ],
        challenges: [
          {
            id: 'c10-5',
            kind: 'true-false',
            prompt:
              'Associativity of a monoid allows combining partial fold results from list halves.',
            correct: true,
            explanation: 'That is why monoids and parallelism fit together.',
          },
          {
            id: 'c10-6',
            kind: 'multiple-choice',
            prompt: 'foldMap is useful when…',
            choices: [
              'You refuse to use map',
              'Elements must be mapped into the monoid type before combining',
              'You need side effects mid-fold',
              'The list is empty only',
            ],
            correctIndex: 1,
            explanation: 'Map to B, then combine with Monoid[B].',
          },
          {
            id: 'c10-7',
            kind: 'fill-blank',
            prompt: 'Empty list for list concatenation monoid:',
            template: 'val listEmpty: List[Int] = ___',
            acceptedAnswers: ['Nil', 'List()', 'List.empty', 'List.empty[Int]'],
            explanation: 'Nil is the identity for ++.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch11-monads',
    chapter: 11,
    title: 'Monads',
    subtitle: 'pure + flatMap: sequencing in a context',
    theme: 'Context-aware steps that still compose.',
    overview:
      'A monad is a type constructor F[_] with pure (aka unit) and flatMap, obeying identity and associativity laws. Option, List, State, Parser, and IO are classic examples — each sequences a different kind of context.',
    quests: [
      {
        id: 'c11-intuition',
        title: 'Monad Intuition',
        blurb: 'What flatMap buys you over map.',
        xp: 75,
        lessons: [
          {
            heading: 'The interface',
            body: [
              'Functor gives map. Monad adds flatMap (bind) and pure. flatMap lets the next computation depend on the previous value while staying inside F.',
              'You can derive map from flatMap and pure: map(fa)(f) = flatMap(fa)(a => pure(f(a))). So every monad is a functor.',
              'for-comprehensions are syntax sugar for nested flatMaps ending in map — ideal for readable sequencing.',
            ],
            code: `trait Monad[F[_]] {
  def pure[A](a: A): F[A]
  def flatMap[A, B](fa: F[A])(f: A => F[B]): F[B]

  def map[A, B](fa: F[A])(f: A => B): F[B] =
    flatMap(fa)(a => pure(f(a)))
}

// Option sequences failure
def both[A, B](oa: Option[A], ob: Option[B]): Option[(A, B)] =
  oa.flatMap(a => ob.map(b => (a, b)))

// Same with for
def both2[A, B](oa: Option[A], ob: Option[B]): Option[(A, B)] =
  for {
    a <- oa
    b <- ob
  } yield (a, b)`,
            callout:
              'Laws: left/right identity with pure, and associativity of flatMap — so refactoring nested binds is safe.',
          },
        ],
        challenges: [
          {
            id: 'c11-1',
            kind: 'multiple-choice',
            prompt: 'The programmer’s essence of a monad is…',
            choices: [
              'A type constructor with map only',
              'F[_] with pure and flatMap (plus laws)',
              'Any class with get',
              'Inheritance sugar',
            ],
            correctIndex: 1,
            explanation: 'pure lifts; flatMap chains in context.',
          },
          {
            id: 'c11-2',
            kind: 'true-false',
            prompt: 'Every monad is also a functor.',
            correct: true,
            explanation: 'map derives from flatMap + pure.',
          },
          {
            id: 'c11-3',
            kind: 'fill-blank',
            prompt: 'Sequence two Options.',
            template:
              'def both[A,B](oa: Option[A], ob: Option[B]): Option[(A,B)] =\n  oa.___(a => ob.map(b => (a, b)))',
            acceptedAnswers: ['flatMap'],
            explanation: 'flatMap sequences; None short-circuits.',
          },
          {
            id: 'c11-4',
            kind: 'multiple-choice',
            prompt: 'Which is NOT monadic sequencing?',
            choices: [
              'Option failing on None',
              'Either short-circuiting on Left',
              'List non-deterministic bind',
              'Adding two Ints with +',
            ],
            correctIndex: 3,
            explanation: 'Int + is monoid/arithmetic, not flatMap sequencing.',
          },
          {
            id: 'c11-5',
            kind: 'spot-bug',
            prompt: 'Which line escapes the Option context?',
            lines: [
              'def loadUser(id: Int): Option[User] = ???',
              'def loadPrefs(u: User): Option[Prefs] = ???',
              '',
              'val u = loadUser(1).get',
              'val p = loadPrefs(u).get',
            ],
            buggyLine: 3,
            explanation: 'Use flatMap or a for-comprehension instead of .get.',
          },
        ],
      },
      {
        id: 'c11-instances',
        title: 'Monads You Already Know',
        blurb: 'Same interface, different meanings.',
        xp: 60,
        lessons: [
          {
            heading: 'One algebra, many stories',
            body: [
              'Option: sequence until absence. Either: sequence until error. List: sequence with non-determinism (flatMap is concatMap). State: sequence while threading state. Id: the trivial monad (just the value).',
              'Recognizing the interface helps you transfer skills: once you can for-comprehend Option, the same shape applies to State and beyond.',
            ],
            code: `// List as monad: every pair
val pairs =
  for {
    x <- List(1, 2)
    y <- List("a", "b")
  } yield (x, y)
// List((1,a),(1,b),(2,a),(2,b))`,
          },
        ],
        challenges: [
          {
            id: 'c11-6',
            kind: 'multiple-choice',
            prompt: 'List’s flatMap models…',
            choices: [
              'Failure only',
              'Non-deterministic / cartesian-style sequencing',
              'Hardware threads',
              'Compilation errors',
            ],
            correctIndex: 1,
            explanation: 'Each element can expand to many; results concatenate.',
          },
          {
            id: 'c11-7',
            kind: 'true-false',
            prompt:
              'State’s flatMap passes the updated state into the next step.',
            correct: true,
            explanation: 'That is how pure state threading composes.',
          },
          {
            id: 'c11-8',
            kind: 'fill-blank',
            prompt: 'Lift a bare value into Option.',
            template: 'def pure[A](a: A): Option[A] = ___(a)',
            acceptedAnswers: ['Some', 'Option', 'Option.apply'],
            explanation: 'Some(a) (or Option(a)) is pure for Option.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch12-applicative',
    chapter: 12,
    title: 'Applicative & Traverse',
    subtitle: 'Combine independent effects; walk structures',
    theme: 'When steps do not need to depend on each other.',
    overview:
      'Applicative functors combine contexts when computations are independent (no flatMap dependency). Traverse / sequence flip structures like List[Option[A]] into Option[List[A]].',
    quests: [
      {
        id: 'c12-applicative',
        title: 'Independent Combination',
        blurb: 'map2 / product without full monadic power.',
        xp: 70,
        lessons: [
          {
            heading: 'Weaker than monad, still powerful',
            body: [
              'Applicative has pure and map2 (or ap). Unlike flatMap, the shape of the second computation does not depend on the first value — both sides are built up-front.',
              'That independence enables useful patterns: validating multiple fields and accumulating errors; running independent Pars; zipping streams.',
              'Every monad can be an applicative, but not every applicative is a monad. Prefer applicative when you do not need dependency — clearer intent, sometimes better laws/performance.',
            ],
            code: `trait Applicative[F[_]] {
  def pure[A](a: A): F[A]
  def map2[A, B, C](fa: F[A], fb: F[B])(f: (A, B) => C): F[C]

  def map[A, B](fa: F[A])(f: A => B): F[B] =
    map2(fa, pure(()))((a, _) => f(a))
}

// Validate both fields even if both fail (with a suitable applicative)
case class Person(name: String, age: Int)

def person(name: Either[String, String],
           age: Either[String, Int]): Either[String, Person] =
  // right-biased Either is monadic (fail-fast). An accumulating Validated
  // type is the usual applicative example for "collect all errors".
  for { n <- name; a <- age } yield Person(n, a)`,
            callout:
              'Remember: monadic Either stops at the first Left; an accumulating Validated-style applicative can report many errors.',
          },
        ],
        challenges: [
          {
            id: 'c12-1',
            kind: 'multiple-choice',
            prompt: 'Applicative map2 is ideal when…',
            choices: [
              'The second effect must depend on the first’s value',
              'Two effects are independent and only their results combine',
              'You need unrestricted mutation',
              'You refuse to use pure',
            ],
            correctIndex: 1,
            explanation: 'Independence is the applicative sweet spot.',
          },
          {
            id: 'c12-2',
            kind: 'true-false',
            prompt: 'Every monad can implement applicative combinators.',
            correct: true,
            explanation: 'map2(fa,fb)(f) = flatMap(fa)(a => map(fb)(b => f(a,b))).',
          },
          {
            id: 'c12-3',
            kind: 'true-false',
            prompt: 'Every applicative is automatically a monad.',
            correct: false,
            explanation:
              'Applicative is weaker; not all applicatives have a lawful flatMap.',
          },
          {
            id: 'c12-4',
            kind: 'fill-blank',
            prompt: 'Lift 1 into List (applicative pure).',
            template: 'val one: List[Int] = List(___)',
            acceptedAnswers: ['1'],
            explanation: 'pure(1) for List is List(1).',
          },
        ],
      },
      {
        id: 'c12-traverse',
        title: 'Traverse & Sequence',
        blurb: 'Flip List and Option (and friends).',
        xp: 65,
        lessons: [
          {
            heading: 'sequence',
            body: [
              'sequence turns F[G[A]] into G[F[A]] for appropriate F (traversable) and G (applicative). Most famous: List[Option[A]] => Option[List[A]] — all Some or total None.',
              'traverse(fa)(f) is map + sequence: map each element with an effectful f, then sequence the results.',
              'This is how you “parse all lines,” “fetch all IDs,” or “validate all fields” in one abstraction.',
            ],
            code: `def sequence[A](oas: List[Option[A]]): Option[List[A]] =
  oas.foldRight(Some(Nil): Option[List[A]]) { (oa, acc) =>
    for {
      a <- oa
      as <- acc
    } yield a :: as
  }

def traverse[A, B](as: List[A])(f: A => Option[B]): Option[List[B]] =
  sequence(as.map(f))

sequence(List(Some(1), Some(2)))      // Some(List(1,2))
sequence(List(Some(1), None, Some(3))) // None`,
          },
        ],
        challenges: [
          {
            id: 'c12-5',
            kind: 'multiple-choice',
            prompt: 'sequence on List[Option[A]] returns None when…',
            choices: [
              'The list is empty',
              'Any element is None',
              'All elements are None only',
              'The list has more than 2 elements',
            ],
            correctIndex: 1,
            explanation: 'All must be Some to produce Some(list).',
          },
          {
            id: 'c12-6',
            kind: 'fill-blank',
            prompt: 'traverse is map then…',
            template: 'def traverse[A,B](as: List[A])(f: A => Option[B]) =\n  ___(as.map(f))',
            acceptedAnswers: ['sequence'],
            explanation: 'traverse = sequence ∘ map.',
          },
          {
            id: 'c12-7',
            kind: 'true-false',
            prompt:
              'traverse needs an Applicative (or Monad) for the effect type G.',
            correct: true,
            explanation: 'Combining G effects uses applicative map2/pure.',
          },
        ],
      },
    ],
  },
]
