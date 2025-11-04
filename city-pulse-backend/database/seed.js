const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('./db.config');

const sampleReports = [
    {
        name: "Pothole",
        location_lat: 46.7773787,
        location_lng: 23.6066821,
        address: "Strada Buftea, Mărăști, Cluj-Napoca, Cluj Metropolitan Area, Cluj, 400186, Romania",
        category: "POTHOLE",
        severity_level: "HIGH",
        status: "PENDING",
        description: "Large pothole in the middle of the road!",
        upvotes: 23,
        images: [
            "/uploads/report-1762195908064-631463351.gif",
            "/uploads/report-1762195908089-406505933.jpeg",
            "/uploads/report-1762195908090-676430511.png"
        ]
    },
    {
        name: "Graffiti",
        location_lat: 46.756932,
        location_lng: 23.5621118,
        address: "Strada Ion Meșter, Mănăștur, Cluj-Napoca, Cluj Metropolitan Area, Cluj, 400651, Romania",
        category: "VANDALISM",
        severity_level: "LOW",
        status: "PENDING",
        description: "Someone graffitied the wall of my apartment building. I want it cleaned up.",
        upvotes: 4,
        images: [
            "/uploads/report-1762197443385-520854171.jpg"
        ]
    }
];

async function seedDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('Starting database seed...');
        
        await client.query('BEGIN');
        
        // Check if data already exists
        const checkResult = await client.query('SELECT COUNT(*) FROM reports');
        const existingCount = parseInt(checkResult.rows[0].count);
        
        if (existingCount > 0) {
            console.log(`Database already contains ${existingCount} reports. Skipping seed.`);
            console.log('To re-seed, delete existing reports first.');
            await client.query('ROLLBACK');
            return;
        }
        
        // Insert each report
        for (const report of sampleReports) {
            console.log(`Inserting report: ${report.name}`);
            
            // Insert report
            const insertReportQuery = `
                INSERT INTO reports (
                    name, location_lat, location_lng, address,
                    category, severity_level, status, description, upvotes
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
            `;
            
            const reportResult = await client.query(insertReportQuery, [
                report.name,
                report.location_lat,
                report.location_lng,
                report.address,
                report.category,
                report.severity_level,
                report.status,
                report.description,
                report.upvotes
            ]);
            
            const reportId = reportResult.rows[0].id;
            
            // Insert images
            if (report.images && report.images.length > 0) {
                for (const imageUrl of report.images) {
                    await client.query(
                        'INSERT INTO report_images (report_id, image_url) VALUES ($1, $2)',
                        [reportId, imageUrl]
                    );
                }
                console.log(`Added ${report.images.length} image(s)`);
            }
        }
        
        await client.query('COMMIT');
        console.log('Database seeded successfully!');
        console.log(`   Inserted ${sampleReports.length} sample reports`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the seed
seedDatabase()
    .then(() => {
        console.log('Seed completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    });