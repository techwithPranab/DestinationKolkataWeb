# Data Manager Module

A comprehensive module for ingesting data from OpenStreetMap, processing it, and loading it into the MongoDB database with pending status for admin approval.

## Features

- **Data Ingestion**: Fetches real-time data from OpenStreetMap (OSM) Overpass API
- **Data Processing**: Normalizes and enriches OSM data with additional metadata
- **Pending Status**: All new records are automatically set to "pending" status
- **Duplicate Prevention**: Checks for existing records using OSM IDs to prevent duplicates
- **Batch Processing**: Processes data in configurable batches for optimal performance
- **Comprehensive Statistics**: Generates detailed reports on ingestion and loading operations
- **Error Handling**: Robust error handling with individual record fallback
- **Flexible Operation**: Can ingest fresh data or load existing JSON files

## Supported Data Types

- **Hotels**: Accommodations, guest houses, hostels
- **Restaurants**: Restaurants, cafes, fast food outlets
- **Attractions**: Historical sites, museums, parks, religious places
- **Sports Facilities**: Stadiums, sports grounds, coaching centers
- **Events**: Sample cultural and sports events
- **Promotions**: Sample promotional offers

## Usage

### 1. Ingest and Load Fresh Data

Fetches data from OpenStreetMap and loads it directly into the database:

```bash
npm run data-manager:ingest
```

This command:
- Fetches data from OSM Overpass API for Kolkata region
- Processes and normalizes the data
- Saves processed data to JSON files in `data/ingested/`
- Loads data into MongoDB with "pending" status
- Generates comprehensive statistics report

### 2. Load Existing Data

Loads data from existing JSON files in `data/ingested/` directory:

```bash
npm run data-manager:load
```

This command:
- Reads existing JSON files
- Loads data into MongoDB with "pending" status
- Generates statistics report
- Useful for reloading data without re-fetching from OSM

### 3. Direct Script Execution

You can also run the script directly with different modes:

```bash
# Ingest and load fresh data
npx tsx scripts/data-manager.ts ingest-and-load

# Load existing data
npx tsx scripts/data-manager.ts load-existing
```

## Data Processing Details

### Status Management
- All newly ingested records are automatically set to **"pending"** status
- This ensures admin review before records become active
- Pending records require manual approval in the admin panel

### Data Enrichment
The module enriches OSM data with:
- **Geographic Information**: Proper GeoJSON coordinates
- **Contact Details**: Phone, email, website extraction
- **Categorization**: Intelligent categorization based on OSM tags
- **Pricing Information**: Estimated price ranges
- **Amenities**: Extracted amenities and facilities
- **Ratings**: Generated sample ratings
- **Timings**: Default opening hours
- **Metadata**: Source tracking, timestamps, tags

### Duplicate Prevention
- Uses OSM IDs to identify duplicate records
- Skips existing records during batch processing
- Maintains data integrity across multiple runs

## Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string (defaults to `mongodb://localhost:27017/destination-kolkata`)

### Processing Parameters
- **Batch Size**: 50 records per batch (configurable in code)
- **Rate Limiting**: 2-second delays between API calls
- **Timeout**: 30-second timeout for OSM API calls
- **Bounding Box**: Kolkata region coordinates

## Output and Statistics

The module generates comprehensive statistics including:

### Collection-wise Statistics
- Total records processed
- Successfully loaded records
- Failed records with error details
- Skipped duplicates
- Pending status records

### Overall Summary
- Total processing time
- Success rates by collection
- Status distribution
- Recommendations for next steps

### Sample Output
```
================================================================================
📊 DATA INGESTION AND LOADING STATISTICS REPORT
================================================================================
📅 Report Generated: 2024-09-06T10:30:00.000Z
⏱️  Processing Time: 45.67 seconds
================================================================================

🏨 Hotels:
   📊 Total Records: 150
   ✅ Successfully Loaded: 145
   ⏳ Pending Status: 145
   ❌ Failed: 3
   ⏭️  Skipped (Duplicates): 2
   📈 Success Rate: 96.7%

🍽️ Restaurants:
   📊 Total Records: 200
   ✅ Successfully Loaded: 195
   ⏳ Pending Status: 195
   ❌ Failed: 4
   ⏭️  Skipped (Duplicates): 1
   📈 Success Rate: 97.5%

...

================================================================================
🎯 OVERALL SUMMARY
================================================================================
📊 Total Records Processed: 850
✅ Total Successfully Loaded: 820
⏳ Total Pending Status: 820
❌ Total Failed: 15
📈 Overall Success Rate: 96.5%
```

## File Structure

```
data/
  ingested/
    hotels.json          # Processed hotel data
    restaurants.json     # Processed restaurant data
    attractions.json     # Processed attraction data
    sports.json          # Processed sports data
    events.json          # Sample events data
    promotions.json      # Sample promotions data

scripts/
  data-manager.ts       # Main data manager module
  ingest-data.ts        # Legacy ingestion script
  load-data.ts          # Legacy loading script
```

## Error Handling

The module includes robust error handling:

- **API Errors**: Retries and fallback mechanisms for OSM API calls
- **Database Errors**: Individual record processing for failed batches
- **Validation Errors**: Data validation with detailed error messages
- **Connection Issues**: Automatic reconnection attempts

## Admin Workflow Integration

After running the data manager:

1. **Admin Review**: All records appear in admin panel with "pending" status
2. **Approval Process**: Admins can review, edit, and approve records
3. **Quality Control**: Ensures data quality before public visibility
4. **Bulk Operations**: Admins can approve/reject multiple records at once

## Performance Considerations

- **Batch Processing**: Processes data in chunks to manage memory
- **Rate Limiting**: Respects OSM API limits with delays
- **Indexing**: Utilizes MongoDB indexes for efficient queries
- **Lean Operations**: Uses lean queries for better performance

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check `MONGODB_URI` environment variable
   - Ensure MongoDB is running
   - Verify network connectivity

2. **OSM API Timeout**
   - Check internet connection
   - Wait and retry (OSM API has rate limits)
   - Consider using existing JSON files instead

3. **Memory Issues**
   - Reduce batch size in code
   - Process smaller datasets
   - Monitor system resources

4. **Duplicate Records**
   - This is normal behavior - duplicates are skipped
   - Check statistics for skipped count

### Logs and Debugging

- Enable verbose logging by modifying the script
- Check console output for detailed error messages
- Review generated JSON files for data validation
- Monitor database for successful insertions

## Future Enhancements

Potential improvements for the module:

- **Configurable Bounding Box**: Support for different geographic regions
- **Data Validation Rules**: Custom validation schemas per data type
- **Progress Callbacks**: Real-time progress reporting
- **Parallel Processing**: Concurrent API calls with rate limiting
- **Data Quality Scoring**: Automated quality assessment
- **Integration APIs**: Support for additional data sources

## Dependencies

- `axios`: HTTP client for OSM API calls
- `mongoose`: MongoDB ODM for database operations
- `fs` and `path`: File system operations for JSON handling

## Related Scripts

- `ingest-data.ts`: Legacy script for data ingestion only
- `load-data.ts`: Legacy script for database loading only
- `seed-database.ts`: Database seeding utilities
