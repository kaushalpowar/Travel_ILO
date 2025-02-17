def print_response(response):
    print(response.response)
    file_names = [metadata["file_name"] for metadata in response.metadata.values()]
    unique_file_names = list(set(file_names))
    print(f"Source: \n {unique_file_names}")
