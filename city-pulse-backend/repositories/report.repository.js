const pool = require('../database/db.config');

// Find all reports with optional filters
const findAll = async (filters = {}) => {
  const { category, status, severity, search } = filters;

  let query = `
    SELECT
      r.id,
      r.name,
      r.date,
      r.location_lat,
      r.location_lng,
      r.address,
      r.category,
      r.severity_level AS "severityLevel",
      r.status,
      r.upvotes,
      r.description,
      r.created_by AS "createdBy",
      COALESCE(
        json_agg(
          DISTINCT ri.image_url
          ORDER BY ri.image_url
        ) FILTER (WHERE ri.image_url IS NOT NULL),
        '[]'
      ) AS images
    FROM reports r
    LEFT JOIN report_images ri ON r.id = ri.report_id
    WHERE 1=1
  `;

  const params = [];
  let paramCounter = 1;

  if (category) {
    query += ` AND r.category = $${paramCounter}`;
    params.push(category);
    paramCounter++;
  }

  if (status) {
    query += ` AND r.status = $${paramCounter}`;
    params.push(status);
    paramCounter++;
  }

  if (severity) {
    query += ` AND r.severity_level = $${paramCounter}`;
    params.push(severity);
    paramCounter++;
  }

  if (search) {
    query += ` AND (
      LOWER(r.name) LIKE $${paramCounter} OR
      LOWER(r.address) LIKE $${paramCounter} OR
      LOWER(r.description) LIKE $${paramCounter}
      )`;
    params.push(`%${search.toLowerCase()}%`);
    paramCounter++;
  }

  query += `
    GROUP BY r.id, r.name, r.date, r.location_lat, r.location_lng, r.address,
      r.category, r.severity_level, r.status, r.upvotes, r.description, r.created_by
      ORDER BY r.date DESC
      `;

  try {
    const result = await pool.query(query, params);

    // Transform database format to application format
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      date: row.date,
      location: {
        lat: row.location_lat,
        lng: row.location_lng
      },
      address: row.address,
      category: row.category,
      severityLevel: row.severityLevel,
      status: row.status,
      upvotes: row.upvotes,
      description: row.description,
      images: row.images || [],
      createdBy: row.createdBy
    }));
  } catch (error) {
    console.error('Database error in findAll:', error);
    throw error;
  }
};

// Find report by ID
const findById = async (id) => {
  const query = `
    SELECT
      r.id,
      r.name,
      r.date,
      r.location_lat,
      r.location_lng,
      r.address,
      r.category,
      r.severity_level AS "severityLevel",
      r.status,
      r.upvotes,
      r.description,
      r.created_by AS "createdBy",
      COALESCE(
        json_agg(
          DISTINCT ri.image_url
          ORDER BY ri.image_url
        ) FILTER (WHERE ri.image_url IS NOT NULL),
        '[]'
      ) AS images
    FROM reports r
    LEFT JOIN report_images ri ON r.id = ri.report_id
    WHERE r.id = $1
    GROUP BY r.id
  `;

  try {
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      date: row.date,
      location: {
        lat: row.location_lat,
        lng: row.location_lng
      },
      address: row.address,
      category: row.category,
      severityLevel: row.severityLevel,
      status: row.status,
      upvotes: row.upvotes,
      description: row.description,
      images: row.images || [],
      createdBy: row.createdBy
    };
  } catch (error) {
    console.error('Database error in findById:', error);
    throw error;
  }
};

// Create new report
const create = async (reportModel) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert report
    const insertReportQuery = `
      INSERT INTO reports (
        name, location_lat, location_lng, address,
        category, severity_level, status, description, upvotes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
     
    const reportResult = await client.query(insertReportQuery, [
      reportModel.name,
      reportModel.location.lat,
      reportModel.location.lng,
      reportModel.address,
      reportModel.category,
      reportModel.severityLevel,
      reportModel.status,
      reportModel.description || null,
      reportModel.upvotes
    ]);

    const newReport = reportResult.rows[0];

    // Insert images if any
    if (reportModel.images && reportModel.images.length > 0) {
      const insertImageQuery = `
        INSERT INTO report_images (report_id, image_url)
        VALUES ($1, $2)
      `;

      for (const imageUrl of reportModel.images) {
        await client.query(insertImageQuery, [newReport.id, imageUrl]);
      }
    }

    await client.query('COMMIT');

    // Return formatted report
    return {
      id: newReport.id,
      name: newReport.name,
      date: newReport.date,
      location: {
        lat: newReport.location_lat,
        lng: newReport.location_lng
      },
      address: newReport.address,
      category: newReport.category,
      severityLevel: newReport.severity_level,
      status: newReport.status,
      upvotes: newReport.upvotes,
      description: newReport.description,
      images: reportModel.images || []
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error in create:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Update report by ID
const updateById = async (id, dataToUpdate) => {
  const client = await pool.connect();

  try {
     await client.query('BEGIN');

     // Build dynamic UPDATE query
     const fields = [];
     const values = [];
     let paramCounter = 1;

     if (dataToUpdate.name !== undefined) {
      fields.push(`name = $${paramCounter}`);
      values.push(dataToUpdate.name);
      paramCounter++;
     }

     if (dataToUpdate.location !== undefined) {
      if (dataToUpdate.location.lat !== undefined) {
        fields.push(`location_lat = $${paramCounter}`);
        values.push(dataToUpdate.location.lat);
        paramCounter++;
      }
      if (dataToUpdate.location.lng !== undefined) {
        fields.push(`location_lng = $${paramCounter}`);
        values.push(dataToUpdate.location.lng);
        paramCounter++;
     }
    }

    if (dataToUpdate.address !== undefined) {
        fields.push(`address = $${paramCounter}`);
        values.push(dataToUpdate.address);
        paramCounter++;
    }
        
    if (dataToUpdate.category !== undefined) {
        fields.push(`category = $${paramCounter}`);
        values.push(dataToUpdate.category);
        paramCounter++;
    }
    
    if (dataToUpdate.severityLevel !== undefined) {
        fields.push(`severity_level = $${paramCounter}`);
        values.push(dataToUpdate.severityLevel);
        paramCounter++;
    }
        
    if (dataToUpdate.status !== undefined) {
        fields.push(`status = $${paramCounter}`);
        values.push(dataToUpdate.status);
        paramCounter++;
    }
        
    if (dataToUpdate.description !== undefined) {
        fields.push(`description = $${paramCounter}`);
        values.push(dataToUpdate.description);
        paramCounter++;
    }
        
    if (dataToUpdate.upvotes !== undefined) {
        fields.push(`upvotes = $${paramCounter}`);
        values.push(dataToUpdate.upvotes);
        paramCounter++;
    }
        
    if (fields.length === 0) {
        await client.query('COMMIT');
        return await findById(id);
    }

    values.push(id);
    const updateQuery = `
      UPDATE reports
      SET ${fields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // Updated images if provided
    if (dataToUpdate.images !== undefined) {
      // Delete existing images
      await client.query('DELETE FROM report_images WHERE report_id = $1', [id]);

      // Insert new images
      if (dataToUpdate.images.length > 0) {
        const insertImageQuery = `
          INSERT INTO report_images (report_id, image_url)
          VALUES ($1, $2)
        `;

        for (const imageUrl of dataToUpdate.images) {
          await client.query(insertImageQuery, [id, imageUrl]);
        }
      }
    }

    await client.query('COMMIT');

    // Fetch and return complete updated report
    return await findById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error in updateById:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Delete report by ID
const deleteById = async (id) => {
  const query = 'DELETE FROM reports WHERE id = $1 RETURNING id';

  try {
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database error in deleteById:', error);
    throw error;
  }
};

module.exports = {
  findAll,
  findById,
  create,
  updateById,
  deleteById
};