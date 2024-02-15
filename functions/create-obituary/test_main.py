from main import *

def test_cloudinary():  # works
    file_name = "git_pfp.jpg"
    res = upload_to_cloudinary(file_name, extra_fields={"eager": "e_art:zorro"})
    print(res["secure_url"], res)
    assert res is not None

def test_gpt():         # works
    prompt = "write an obituary about a fictional character named Bob who was born on 2002 and died on 2023"
    description = ask_gpt(prompt)
    print(description)
    assert len(description) > 0

def test_polly():       # works with permissions!
    text = "So-sour candy. I'm sour candy, so sweet, then I get a little angry, yeah."
    res = read_this(text)
    assert os.path.exists(res)
    res = upload_to_cloudinary(res, resource_type="raw")
    print(res["secure_url"])
    assert len(res["secure_url"]) > 0