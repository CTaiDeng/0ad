/////////////////////////////////////////////////////////////////////
//	Vector2D
//
//	Class for representing and manipulating 2D vectors
//
/////////////////////////////////////////////////////////////////////

// TODO: Type errors if v not instanceof Vector classes
// TODO: Possibly implement in C++

function Vector2D(x, y)
{
	if (arguments.length == 2)
		this.set(x, y);
	else
		this.set(0, 0);
}

Vector2D.prototype.clone = function()
{
	return new Vector2D(this.x, this.y);
};

// Mutating 2D functions
//
// These functions modify the current object,
// and always return this object to allow chaining

Vector2D.prototype.set = function(x, y)
{
	this.x = x;
	this.y = y;
	return this;
};

Vector2D.prototype.add = function(v)
{
	this.x += v.x;
	this.y += v.y;
	return this;
};

Vector2D.prototype.sub = function(v)
{
	this.x -= v.x;
	this.y -= v.y;
	return this;
};

Vector2D.prototype.mult = function(f)
{
	this.x *= f;
	this.y *= f;
	return this;
};

Vector2D.prototype.div = function(f)
{
	this.x /= f;
	this.y /= f;
	return this;
};

Vector2D.prototype.normalize = function()
{
	let magnitude = this.length();
	if (!magnitude)
		return this;

	return this.div(magnitude);
};

/**
 * Rotate a radians anti-clockwise
 */
Vector2D.prototype.rotate = function(a)
{
	let sin = Math.sin(a);
	let cos = Math.cos(a);

	let x = this.x * cos + this.y * sin;
	let y = this.y * cos - this.x * sin;

	this.x = x;
	this.y = y;

	return this;
};

// Numeric 2D info functions (non-mutating)
//
// These methods serve to get numeric info on the vector, they don't modify the vector

/**
 * Return the vector that forms a right angle with this one.
 */
Vector2D.prototype.perpendicular = function()
{
	return new Vector2D(-this.y, this.x);
};

/**
 * Computes the scalar product of the two vectors.
 * Geometrically, this is the product of the length of the two vectors and the cosine of the angle between them.
 * If the vectors are orthogonal, the product is zero.
 */
Vector2D.prototype.dot = function(v)
{
	return this.x * v.x + this.y * v.y;
};

/**
 * Computes the non-zero coordinate of the cross product of the two vectors.
 * Geometrically, the cross of the vectors is the 3D vector perpendicular to the two 2D vectors.
 * This returned length of that vector equals the area of the parallelogram that the vectors span.
 */
Vector2D.prototype.cross = function(v)
{
	return this.x * v.y - this.y * v.x;
};

Vector2D.prototype.lengthSquared = function()
{
	return this.dot(this);
};

Vector2D.prototype.length = function()
{
	return Math.sqrt(this.lengthSquared());
};

/**
 * Compare this length to the length of v,
 * @return 0 if the lengths are equal
 * @return 1 if this is longer than v
 * @return -1 if this is shorter than v
 * @return NaN if the vectors aren't comparable
 */
Vector2D.prototype.compareLength = function(v)
{
	return Math.sign(this.lengthSquared() - v.lengthSquared());
};

Vector2D.prototype.distanceToSquared = function(v)
{
	return Math.euclidDistance2DSquared(this.x, this.y, v.x, v.y);
};

Vector2D.prototype.distanceTo = function(v)
{
	return Math.euclidDistance2D(this.x, this.y, v.x, v.y);
};

// Static 2D functions
//
// Static functions that return a new vector object.
// Note that object creation is slow in JS, so use them only when necessary

Vector2D.from3D = function(v)
{
	return new Vector2D(v.x, v.z);
};

Vector2D.add = function(v1, v2)
{
	return new Vector2D(v1.x + v2.x, v1.y + v2.y);
};

Vector2D.sub = function(v1, v2)
{
	return new Vector2D(v1.x - v2.x, v1.y - v2.y);
};

Vector2D.mult = function(v, f)
{
	return new Vector2D(v.x * f, v.y * f);
};

Vector2D.div = function(v, f)
{
	return new Vector2D(v.x / f, v.y / f);
};

Vector2D.avg = function(vectorList)
{
	return Vector2D.sum(vectorList).div(vectorList.length);
};

Vector2D.sum = function(vectorList)
{
	var sum = new Vector2D();
	vectorList.forEach(v => sum.add(v));
	return sum;
};

/////////////////////////////////////////////////////////////////////
//	Vector3D
//
//	Class for representing and manipulating 3D vectors
//
/////////////////////////////////////////////////////////////////////

function Vector3D(x, y, z)
{
	if (arguments.length == 3)
		this.set(x, y, z);
	else
		this.set(0, 0, 0);
}

Vector3D.prototype.clone = function()
{
	return new Vector3D(this.x, this.y, this.z);
};

// Mutating 3D functions
//
// These functions modify the current object,
// and always return this object to allow chaining

Vector3D.prototype.set = function(x, y, z)
{
	this.x = x;
	this.y = y;
	this.z = z;
	return this;
};

Vector3D.prototype.add = function(v)
{
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
};

Vector3D.prototype.sub = function(v)
{
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;
	return this;
};

Vector3D.prototype.mult = function(f)
{
	this.x *= f;
	this.y *= f;
	this.z *= f;
	return this;
};

Vector3D.prototype.div = function(f)
{
	this.x /= f;
	this.y /= f;
	this.z /= f;
	return this;
};

Vector3D.prototype.normalize = function()
{
	let magnitude = this.length();
	if (!magnitude)
		return this;

	return this.div(magnitude);
};

// Numeric 3D info functions (non-mutating)
//
// These methods serve to get numeric info on the vector, they don't modify the vector

Vector3D.prototype.dot = function(v)
{
	return this.x * v.x + this.y * v.y + this.z * v.z;
};

/**
 * Returns a vector perpendicular to the two given vectors.
 * The length of the returned vector corresponds to the area of the parallelogram with the vectors for sides.
 */
Vector3D.prototype.cross = function(v)
{
	return new Vector3D(
		this.y * v.z - this.z * v.y,
		this.z * v.x - this.x * v.z,
		this.x * v.y - this.y * v.x);
};

Vector3D.prototype.lengthSquared = function()
{
	return this.dot(this);
};

Vector3D.prototype.length = function()
{
	return Math.sqrt(this.lengthSquared());
};

/**
 * Compare this length to the length of v,
 * @return 0 if the lengths are equal
 * @return 1 if this is longer than v
 * @return -1 if this is shorter than v
 * @return NaN if the vectors aren't comparable
 */
Vector3D.prototype.compareLength = function(v)
{
	return Math.sign(this.lengthSquared() - v.lengthSquared());
};

Vector3D.prototype.distanceToSquared = function(v)
{
	return Math.euclidDistance3DSquared(this.x, this.y, this.z, v.x, v.y, v.z);
};

Vector3D.prototype.distanceTo = function(v)
{
	return Math.euclidDistance3D(this.x, this.y, this.z, v.x, v.y, v.z);
};

Vector3D.prototype.horizDistanceToSquared = function(v)
{
	return Math.euclidDistance2DSquared(this.x, this.z, v.x, v.z);
};

Vector3D.prototype.horizDistanceTo = function(v)
{
	return Math.sqrt(this.horizDistanceToSquared(v));
};

// Static 3D functions
//
// Static functions that return a new vector object.
// Note that object creation is slow in JS, so use them only when really necessary

Vector3D.add = function(v1, v2)
{
	return new Vector3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
};

Vector3D.sub = function(v1, v2)
{
	return new Vector3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
};

Vector3D.mult = function(v, f)
{
	return new Vector3D(v.x * f, v.y * f, v.z * f);
};

Vector3D.div = function(v, f)
{
	return new Vector3D(v.x / f, v.y / f, v.z / f);
};


// make the prototypes easily accessible to C++
const Vector2Dprototype = Vector2D.prototype;
const Vector3Dprototype = Vector3D.prototype;
