from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
import pandas as pd
import json

bd_categories = [
    {
        "id": 11,
        "category_set": [],
        "name": "Bitters",
        "background": '',
        "color": "#510f0f",
        "parent": ''
    },
    {
        "id": 7,
        "category_set": [],
        "name": "Brandy",
        "background": '',
        "color": "#594D5B",
        "parent": ''
    },
    {
        "id": 2,
        "category_set": [],
        "name": "Gin",
        "background": "https://dev-app-probaar.s3.amazonaws.com/media/news/category/background/1998.webp",
        "color": "#00868B",
        "parent": ''
    },
    {
        "id": 8,
        "category_set": [],
        "name": "Licores",
        "background": "https://dev-app-probaar.s3.amazonaws.com/media/news/category/background/depositphotos_115203820-stock-photo-bottles-of-assorted-hard-liquor.jpg",
        "color": "#028A0F",
        "parent": ''
    },
    {
        "id": 3,
        "category_set": [],
        "name": "Ron",
        "background": "https://dev-app-probaar.s3.amazonaws.com/media/news/category/background/20007579.webp",
        "color": "#65350F",
        "parent": ''
    },
    {
        "id": 6,
        "category_set": [],
        "name": "Tequila",
        "background": "https://dev-app-probaar.s3.amazonaws.com/media/news/category/background/1207249001.webp",
        "color": "#F4C900",
        "parent": ''
    },
    {
        "id": 1,
        "category_set": [],
        "name": "Vodka",
        "background": "https://dev-app-probaar.s3.amazonaws.com/media/news/category/background/20126206.webp",
        "color": "#000080",
        "parent": ''
    },
    {
        "id": 4,
        "category_set": [],
        "name": "Whisky",
        "background": "https://dev-app-probaar.s3.amazonaws.com/media/news/category/background/0100436744-000000000004722504-0-c515Wx515H.jpg",
        "color": "#FD6A02",
        "parent": ''
    }
]

sheet1_columns = ['Product ID', 'Name', 'Headline', 'Description', 'ABV', 'image', 'brand', 'categories']
sheet2_columns = ['ProductID', 'SKU', 'EAN', 'fabrique code', 'unit', 'measure']

def validateCategoriesInRow(row, available_categories):
    categories = row['categories'].split(',')
    for category in categories:
        if not any(bd_category['name'].lower() == category.lower() for bd_category in available_categories):
            raise Exception('found an invalid category ' + category)

def validateCategories(excel_file, available_categories):
    data = pd.read_excel(excel_file, sheet_name=0)
    data.apply(lambda row: validateCategoriesInRow(row, available_categories), axis=1)

def validateSheet1Columns(excel_file):
    df = pd.read_excel(excel_file, sheet_name=0, nrows=0)
    for column in sheet1_columns:
        if column not in df.columns:
            raise Exception('column '+ column + ' not found in sheet 1')
    return excel_file

def validateSheet2Columns(excel_file):
    df = pd.read_excel(excel_file, sheet_name=1, nrows=0)
    for column in sheet2_columns:
        if column not in df.columns:
            raise Exception('column '+ column + ' not found in sheet 2')
    return excel_file

def validateSheet1Row(row):
    non_empty_series = row.notna()
    non_empty_series['image'] = True
    for index in non_empty_series.index:
        if non_empty_series[index] == False:
            raise Exception('some row has empty data')

def validateSheet1Rows(excel_file):
    data = pd.read_excel(excel_file, sheet_name=0)
    data.apply(validateSheet1Row, axis=1)

def validateSheet2Row(row):
    non_empty_series = row.notna()
    for index in non_empty_series.index:
        if non_empty_series[index] == False:
            raise Exception('some row has empty data')

def validateSheet2Rows(excel_file):
    data = pd.read_excel(excel_file, sheet_name=1)
    data.apply(validateSheet2Row, axis=1)

def validateAtLeastOneLabelPerProduct(excel_file):
    sheet1_data = pd.read_excel(excel_file, sheet_name=0)
    sheet2_data = pd.read_excel(excel_file, sheet_name=1)

    for product_id in sheet1_data['Product ID']:
        if sheet2_data.loc[sheet2_data['EAN'] == product_id].empty:
            raise Exception('no label(s) found for ' + product_id)


def convertToDict(excel_file, available_categories):
    sheet1_data = pd.read_excel(excel_file, sheet_name=0)
    sheet2_data = pd.read_excel(excel_file, sheet_name=1)

    sheet1_dict = sheet1_data.fillna(value={'image': ''}).to_dict(orient='records')

    for product in sheet1_dict:
        labels = sheet2_data.loc[sheet2_data['EAN'] == product['Product ID']].to_dict(orient='records')
        product['labels'] = labels

        categories = product['categories'].split(',')

        categories_dict = []

        for category in categories:
            matched_bd_category = next(filter(lambda bd_category: bd_category['name'].lower() == category.lower(), available_categories))
            categories_dict.append({
                'id': matched_bd_category['id'],
                'name': matched_bd_category['name']
            })

        product['categories'] = categories_dict

    return sheet1_dict



class ExcelViewSet(viewsets.GenericViewSet):
    queryset = None
    serializer_class = None


    @action(detail=False, methods=['POST'])
    def validate(self, request):
        try:
            try:
                excel_file = request.data['excel']
            except Exception as e:
                return Response({'error': 'should provide excel file in excel field inside the body'})
            validateSheet1Columns(excel_file)
            validateSheet2Columns(excel_file)
            validateSheet1Rows(excel_file)
            validateCategories(excel_file, bd_categories)
            validateSheet2Rows(excel_file)
            validateAtLeastOneLabelPerProduct(excel_file)
            data_dict = convertToDict(excel_file, bd_categories)
            return Response({'data':data_dict})
        except Exception as e:
            print(e)
            return Response({'error': str(e)})


    @action(detail=False, methods=['POST'])
    def save(self, request):
        print(request.data)
        return Response({'data': 'saved'})
