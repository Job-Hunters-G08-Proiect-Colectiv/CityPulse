const pool = require("../database/db.config");

// 🔹 Summary of all reports
exports.getOverview = async () => {
  const query = `
    SELECT 
      COUNT(*) AS total_reports,
      COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
      COUNT(*) FILTER (WHERE status = 'WORKING') AS working,
      COUNT(*) FILTER (WHERE status = 'PLANNING') AS planning,
      COUNT(*) FILTER (WHERE status = 'DONE') AS done
    FROM reports;
  `;

  const result = await pool.query(query);
  return result.rows[0];
};

// 🔹 Reports grouped by district within a city
exports.getByDistrict = async (cityId) => {
  const query = `
    SELECT 
      d.name AS district,
      COUNT(r.id) AS total_reports,
      COUNT(r.id) FILTER (WHERE r.status = 'PENDING') AS pending,
      COUNT(r.id) FILTER (WHERE r.status = 'DONE') AS done
    FROM districts d
    LEFT JOIN reports r ON r.district_id = d.id
    WHERE d.city_id = $1
    GROUP BY d.id
    ORDER BY total_reports DESC;
  `;

  const result = await pool.query(query, [cityId]);
  return result.rows;
};

// 🔹 Reports grouped by category
exports.getByCategory = async () => {
  const query = `
    SELECT 
      category,
      COUNT(*) AS count
    FROM reports
    GROUP BY category
    ORDER BY count DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
};

// 🔹 Reports grouped by severity
exports.getBySeverity = async () => {
  const query = `
    SELECT 
      severity_level AS severity,
      COUNT(*) AS count
    FROM reports
    GROUP BY severity_level
    ORDER BY count DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
};
