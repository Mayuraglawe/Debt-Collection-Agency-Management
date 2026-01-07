# ML Service

Python-based Machine Learning service for Debt Collection Agency Management system.

## Structure

```
ml-service/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── routers/             # API endpoints
│   ├── models/              # ML model classes
│   ├── training/            # Model training scripts
│   └── utils/               # Helper functions
├── data/                    # Datasets & processed data
├── notebooks/               # Jupyter notebooks (EDA)
├── models/                  # Saved model artifacts
└── tests/                   # ML service tests
```

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Service

```bash
# Development mode
uvicorn app.main:app --reload --port 8000

# Or using Python directly
python -m app.main
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
pytest tests/
```

## Development

- Add new API endpoints in `app/routers/`
- Add ML models in `app/models/`
- Add training scripts in `app/training/`
- Store datasets in `data/`
- Use Jupyter notebooks in `notebooks/` for exploratory data analysis
